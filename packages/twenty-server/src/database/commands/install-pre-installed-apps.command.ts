import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { PreInstalledAppsService } from 'src/engine/core-modules/application/pre-installed-apps/pre-installed-apps.service';

// Backfill command for the `PRE_INSTALLED_APPS` config. Iterates active and
// suspended workspaces and installs every pre-installed app that isn't yet
// installed. Idempotent — workspaces that already have the app skip over
// cleanly (ApplicationInstallService short-circuits when the same version
// is already present). Run after changing `PRE_INSTALLED_APPS` to roll the
// change out to existing tenants.
@Command({
  name: 'install-pre-installed-apps',
  description:
    'Install all apps listed in PRE_INSTALLED_APPS on every active and suspended workspace. Idempotent.',
})
export class InstallPreInstalledAppsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly preInstalledAppsService: PreInstalledAppsService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Installing pre-installed apps on workspace ${workspaceId} (${index + 1}/${total})`,
    );

    if (dryRun) {
      return;
    }

    await this.preInstalledAppsService.installOnWorkspace(workspaceId);
  }
}
