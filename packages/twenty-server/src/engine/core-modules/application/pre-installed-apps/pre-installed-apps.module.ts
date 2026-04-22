import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { MarketplaceModule } from 'src/engine/core-modules/application/application-marketplace/marketplace.module';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { PreInstalledAppsService } from 'src/engine/core-modules/application/pre-installed-apps/pre-installed-apps.service';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationRegistrationVariableEntity,
    ]),
    ApplicationInstallModule,
    ApplicationRegistrationModule,
    MarketplaceModule,
    SecretEncryptionModule,
    TwentyConfigModule,
  ],
  providers: [PreInstalledAppsService],
  exports: [PreInstalledAppsService],
})
export class PreInstalledAppsModule {}
