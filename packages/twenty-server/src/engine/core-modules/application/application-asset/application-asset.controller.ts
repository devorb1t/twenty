import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { join } from 'path';

import { Request, Response } from 'express';
import { FileFolder } from 'twenty-shared/types';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { buildRegistryCdnUrl } from 'src/engine/core-modules/application/application-marketplace/utils/build-registry-cdn-url.util';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { setFileResponseHeaders } from 'src/engine/core-modules/file/utils/set-file-response-headers.utils';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  FileException,
  FileExceptionCode,
} from 'src/engine/core-modules/file/file.exception';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';

@Controller()
export class ApplicationAssetController {
  constructor(
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationService: ApplicationService,
    private readonly fileService: FileService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  // @deprecated Use GET /applications/:applicationId/assets/*path instead.
  // Kept for backwards compatibility with older SDK versions.
  @Get('public-assets/:workspaceId/:applicationId/*path')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getPublicAssets(
    @Res() res: Response,
    @Req() req: Request,
    @Param('workspaceId') workspaceId: string,
    @Param('applicationId')
    applicationId: string,
  ) {
    const filepath = join(...req.params.path);

    try {
      const { stream, mimeType } = await this.fileService.getFileStreamByPath({
        workspaceId,
        applicationId,
        fileFolder: FileFolder.PublicAsset,
        filepath,
      });

      setFileResponseHeaders(res, mimeType);

      stream.on('error', () => {
        throw new FileException(
          'Error streaming file from storage',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        );
      });

      stream.pipe(res);
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        throw new FileException(
          'File not found',
          FileExceptionCode.FILE_NOT_FOUND,
        );
      }

      throw new FileException(
        `Error retrieving file: ${error.message}`,
        FileExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('applications/:applicationId/assets/*path')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getApplicationAsset(
    @Res() res: Response,
    @Req() req: Request,
    @Param('applicationId')
    applicationId: string,
  ) {
    const filepath = join(...req.params.path);

    const application = await this.applicationService.findById(applicationId);

    if (!application) {
      throw new NotFoundException(
        `Application with id '${applicationId}' not found`,
      );
    }

    try {
      const { stream, mimeType } = await this.fileService.getFileStreamByPath({
        workspaceId: application.workspaceId,
        applicationId,
        fileFolder: FileFolder.PublicAsset,
        filepath,
      });

      setFileResponseHeaders(res, mimeType);

      stream.on('error', () => {
        throw new FileException(
          'Error streaming file from storage',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        );
      });

      stream.pipe(res);
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        throw new FileException(
          'File not found',
          FileExceptionCode.FILE_NOT_FOUND,
        );
      }

      throw new FileException(
        `Error retrieving file: ${error.message}`,
        FileExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('application-registrations/:applicationRegistrationId/assets/*path')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getApplicationRegistrationAsset(
    @Res() res: Response,
    @Req() req: Request,
    @Param('applicationRegistrationId') applicationRegistrationId: string,
  ) {
    const filepath = join(...req.params.path);

    const registration =
      await this.applicationRegistrationService.findOneByIdGlobal(
        applicationRegistrationId,
      );

    if (
      registration.sourceType === ApplicationRegistrationSourceType.NPM &&
      registration.sourcePackage &&
      registration.latestAvailableVersion
    ) {
      const cdnBaseUrl = this.twentyConfigService.get('APP_REGISTRY_CDN_URL');

      const cdnUrl = buildRegistryCdnUrl({
        cdnBaseUrl,
        packageName: registration.sourcePackage,
        version: registration.latestAvailableVersion,
        filePath: filepath,
      });

      return res.redirect(cdnUrl);
    }

    if (
      (registration.sourceType === ApplicationRegistrationSourceType.TARBALL ||
        registration.sourceType === ApplicationRegistrationSourceType.LOCAL) &&
      registration.ownerWorkspaceId
    ) {
      const application =
        await this.applicationRegistrationService.findApplicationByRegistrationId(
          registration.id,
          registration.ownerWorkspaceId,
        );

      if (!application) {
        throw new NotFoundException(
          `No installed application found for registration ${applicationRegistrationId}`,
        );
      }

      const { stream, mimeType } = await this.fileService.getFileStreamByPath({
        workspaceId: registration.ownerWorkspaceId,
        applicationId: application.id,
        fileFolder: FileFolder.PublicAsset,
        filepath,
      });

      setFileResponseHeaders(res, mimeType);

      stream.pipe(res);

      return;
    }

    throw new NotFoundException(
      `Public asset not available for registration ${applicationRegistrationId}`,
    );
  }
}
