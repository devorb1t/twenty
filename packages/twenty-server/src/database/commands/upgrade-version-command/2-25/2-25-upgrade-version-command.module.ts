import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillMessageListMembersJunctionTargetCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1784567000000-backfill-message-list-members-junction-target.command';
import { ReconcileIndexViewUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-workspace-command-1785145396787-reconcile-index-view-universal-identifier.command';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity, ViewEntity, ViewFieldEntity]),
    WorkspaceCacheModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    BackfillMessageListMembersJunctionTargetCommand,
    ReconcileIndexViewUniversalIdentifierCommand,
  ],
})
export class V2_25_UpgradeVersionCommandModule {}
