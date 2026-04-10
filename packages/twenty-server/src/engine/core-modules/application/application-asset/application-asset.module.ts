import { Module } from '@nestjs/common';
import { ApplicationAssetController } from 'src/engine/core-modules/application/application-asset/application-asset.controller';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';

@Module({
  imports: [ApplicationRegistrationModule, ApplicationModule, FileModule],
  controllers: [ApplicationAssetController],
})
export class ApplicationAssetModule {}
