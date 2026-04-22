import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Resolves the `PRE_INSTALLED_APPS` server config into `ApplicationRegistration`
// rows on startup and installs them on workspaces (new workspace hook +
// backfill CLI command). Server admins set `PRE_INSTALLED_APPS` to a
// comma-separated list of npm package names; any server-variable values
// declared in the manifest are seeded from matching env vars.
@Injectable()
export class PreInstalledAppsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PreInstalledAppsService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly marketplaceService: MarketplaceService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly secretEncryptionService: SecretEncryptionService,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly applicationRegistrationVariableRepository: Repository<ApplicationRegistrationVariableEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.ensureRegistrationsExist();
    } catch (error) {
      // Bootstrap failures must not prevent the server from starting.
      // New workspaces will retry registration resolution at install time.
      this.logger.error(
        `Failed to ensure pre-installed app registrations at bootstrap: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  getPreInstalledPackageNames(): string[] {
    const raw = this.twentyConfigService.get('PRE_INSTALLED_APPS') ?? '';

    return raw
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  }

  // Idempotent: fetches each pre-installed package's manifest from the
  // app registry CDN, upserts its ApplicationRegistration, and seeds any
  // declared server variables from matching env vars.
  async ensureRegistrationsExist(): Promise<ApplicationRegistrationEntity[]> {
    const packageNames = this.getPreInstalledPackageNames();

    if (packageNames.length === 0) {
      return [];
    }

    const registryPackages = await this.marketplaceService
      .fetchAppsFromRegistry()
      .catch(() => []);

    const versionByName = new Map(
      registryPackages.map((pkg) => [pkg.name, pkg.version] as const),
    );

    const resolvedRegistrations: ApplicationRegistrationEntity[] = [];

    for (const packageName of packageNames) {
      const version = versionByName.get(packageName);

      if (!isDefined(version)) {
        this.logger.warn(
          `Pre-installed app "${packageName}" not found in the app registry`,
        );
        continue;
      }

      const manifest =
        await this.marketplaceService.fetchManifestFromRegistryCdn(
          packageName,
          version,
        );

      if (!manifest) {
        this.logger.warn(
          `Manifest not found for pre-installed app "${packageName}@${version}"`,
        );
        continue;
      }

      const universalIdentifier = manifest.application.universalIdentifier;

      await this.applicationRegistrationService.upsertFromCatalog({
        universalIdentifier,
        name: manifest.application.displayName ?? packageName,
        sourceType: ApplicationRegistrationSourceType.NPM,
        sourcePackage: packageName,
        latestAvailableVersion: version,
        isListed: true,
        isFeatured: false,
        manifest,
        ownerWorkspaceId: null,
      });

      await this.seedServerVariablesFromEnv(universalIdentifier);

      const registration = await this.applicationRegistrationRepository.findOne(
        {
          where: { universalIdentifier },
        },
      );

      if (registration) {
        resolvedRegistrations.push(registration);
      }
    }

    return resolvedRegistrations;
  }

  // Installs all pre-installed apps on a single workspace. Per-app failures
  // are logged but never block the other installs or workspace creation.
  // ApplicationInstallService acquires a per-app cache lock internally, so
  // installs are safe to run in parallel.
  async installOnWorkspace(workspaceId: string): Promise<void> {
    const packageNames = this.getPreInstalledPackageNames();

    if (packageNames.length === 0) {
      return;
    }

    let registrations = await this.findRegistrationsForPackages(packageNames);

    // If a registration is missing, bootstrap may have failed (CDN outage,
    // cold-start race with workspace creation). Retry resolution once so
    // new workspaces aren't stuck missing apps until the admin runs the
    // backfill command.
    if (registrations.length < packageNames.length) {
      this.logger.log(
        `Missing ${packageNames.length - registrations.length} pre-installed app registration(s) on workspace ${workspaceId}, retrying resolution`,
      );

      await this.ensureRegistrationsExist();

      registrations = await this.findRegistrationsForPackages(packageNames);
    }

    await Promise.allSettled(
      registrations.map(async (registration) => {
        try {
          await this.applicationInstallService.installApplication({
            appRegistrationId: registration.id,
            workspaceId,
          });
        } catch (error) {
          this.logger.error(
            `Failed to install pre-installed app "${registration.sourcePackage}" on workspace ${workspaceId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }),
    );
  }

  // Reads declared server variables on the registration and, for any that
  // are still empty, populates them with the value of a matching env var
  // (same name). Existing values are never overwritten — a server admin
  // can manage them through the admin UI once set.
  private async seedServerVariablesFromEnv(
    universalIdentifier: string,
  ): Promise<void> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { universalIdentifier },
      relations: ['variables'],
    });

    if (!registration) {
      return;
    }

    for (const variable of registration.variables) {
      if (variable.encryptedValue !== '') {
        continue;
      }

      const envValue = process.env[variable.key];

      if (!isDefined(envValue) || envValue.length === 0) {
        continue;
      }

      // ApplicationRegistrationVariable.encryptedValue is always stored
      // encrypted regardless of `isSecret` (matches the write path in
      // ApplicationRegistrationVariableService). isSecret governs display
      // only, not storage.
      await this.applicationRegistrationVariableRepository.update(variable.id, {
        encryptedValue: this.secretEncryptionService.encrypt(envValue),
      });
    }
  }

  private async findRegistrationsForPackages(
    packageNames: string[],
  ): Promise<ApplicationRegistrationEntity[]> {
    return this.applicationRegistrationRepository.find({
      where: packageNames.map((sourcePackage) => ({
        sourcePackage,
        sourceType: ApplicationRegistrationSourceType.NPM,
      })),
    });
  }
}
