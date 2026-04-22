import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type DataSource, type QueryRunner, Repository } from 'typeorm';

import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const EXA_PACKAGE_NAME = 'twenty-exa';

// One-shot bridge for instances that set `EXA_API_KEY` as an env var under
// the old web-search driver. Registers `twenty-exa` as an application,
// seeds the key onto its `ApplicationRegistrationVariable`, and flips
// `isPreInstalled=true` so the next workspace install backfills it. The
// env var can be removed from infra after deploy. Idempotent — each step
// no-ops when its target already exists.
@RegisteredInstanceCommand('2.0.0', 1776894434000, { type: 'slow' })
@Injectable()
export class SeedExaPreInstallFromEnvSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    SeedExaPreInstallFromEnvSlowInstanceCommand.name,
  );

  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly secretEncryptionService: SecretEncryptionService,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly applicationRegistrationVariableRepository: Repository<ApplicationRegistrationVariableEntity>,
  ) {}

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}

  async runDataMigration(_dataSource: DataSource): Promise<void> {
    const apiKey = process.env.EXA_API_KEY;

    if (!apiKey || apiKey.length === 0) {
      this.logger.log('EXA_API_KEY not set — skipping Exa pre-install seed.');

      return;
    }

    const packages = await this.marketplaceService.fetchAppsFromRegistry();
    const exaPackage = packages.find((pkg) => pkg.name === EXA_PACKAGE_NAME);

    if (!exaPackage) {
      this.logger.warn(
        `"${EXA_PACKAGE_NAME}" not found in the app registry — skipping seed. ` +
          `Publish the package first, then run \`install-pre-installed-apps\` to backfill.`,
      );

      return;
    }

    const manifest = await this.marketplaceService.fetchManifestFromRegistryCdn(
      exaPackage.name,
      exaPackage.version,
    );

    if (!manifest) {
      this.logger.warn(
        `Manifest not found for "${EXA_PACKAGE_NAME}@${exaPackage.version}" — skipping seed.`,
      );

      return;
    }

    await this.applicationRegistrationService.upsertFromCatalog({
      universalIdentifier: manifest.application.universalIdentifier,
      name: manifest.application.displayName ?? exaPackage.name,
      sourceType: ApplicationRegistrationSourceType.NPM,
      sourcePackage: exaPackage.name,
      latestAvailableVersion: exaPackage.version,
      isListed: true,
      isFeatured: false,
      manifest,
      ownerWorkspaceId: null,
    });

    const registration = await this.applicationRegistrationRepository.findOne({
      where: { universalIdentifier: manifest.application.universalIdentifier },
    });

    if (!registration) {
      this.logger.error(
        `upsertFromCatalog did not produce a registration for "${EXA_PACKAGE_NAME}".`,
      );

      return;
    }

    // Fill EXA_API_KEY only when unset — never overwrite a value already
    // edited via the admin UI.
    const variable =
      await this.applicationRegistrationVariableRepository.findOne({
        where: {
          applicationRegistrationId: registration.id,
          key: 'EXA_API_KEY',
        },
      });

    if (variable && variable.encryptedValue === '') {
      await this.applicationRegistrationVariableRepository.update(variable.id, {
        encryptedValue: this.secretEncryptionService.encrypt(apiKey),
      });
    }

    if (!registration.isPreInstalled) {
      await this.applicationRegistrationRepository.update(registration.id, {
        isPreInstalled: true,
      });
    }

    this.logger.log(
      `Seeded "${EXA_PACKAGE_NAME}" registration + EXA_API_KEY + isPreInstalled=true. ` +
        `Run \`install-pre-installed-apps\` to backfill existing workspaces.`,
    );
  }
}
