import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

// Installs ApplicationRegistrations flagged `isPreInstalled=true` onto
// workspaces. Used by the new-workspace hook and by the
// `install-pre-installed-apps` CLI command (backfill for existing tenants).
@Injectable()
export class PreInstalledAppsService {
  private readonly logger = new Logger(PreInstalledAppsService.name);

  constructor(
    private readonly applicationInstallService: ApplicationInstallService,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
  ) {}

  // Per-app failures are logged but never block the other installs or the
  // workspace-creation path. ApplicationInstallService acquires a per-app
  // cache lock internally, so installs are safe to run in parallel.
  async installOnWorkspace(workspaceId: string): Promise<void> {
    const registrations = await this.applicationRegistrationRepository.find({
      where: { isPreInstalled: true },
    });

    if (registrations.length === 0) {
      return;
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
            `Failed to install pre-installed app "${registration.name}" (${registration.id}) on workspace ${workspaceId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }),
    );
  }
}
