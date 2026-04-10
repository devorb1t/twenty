// Factory-based jest.mock calls prevent the circular entity dependency chain
// (ApplicationRegistrationEntity ↔ UserEntity ↔ WorkspaceEntity) from loading.
jest.mock(
  'src/engine/core-modules/application/application-registration/application-registration.service',
  () => ({ ApplicationRegistrationService: jest.fn() }),
);
jest.mock('src/engine/core-modules/application/application.service', () => ({
  ApplicationService: jest.fn(),
}));
jest.mock(
  'src/engine/core-modules/twenty-config/twenty-config.service',
  () => ({ TwentyConfigService: jest.fn() }),
);
jest.mock('src/engine/core-modules/file/services/file.service', () => ({
  FileService: jest.fn(),
}));

import { type CanActivate, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { Readable } from 'stream';

import { FileFolder } from 'twenty-shared/types';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  FileException,
  FileExceptionCode,
} from 'src/engine/core-modules/file/file.exception';
import { FileApiExceptionFilter } from 'src/engine/core-modules/file/filters/file-api-exception.filter';
import { FileByIdGuard } from 'src/engine/core-modules/file/guards/file-by-id.guard';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ApplicationAssetController } from 'src/engine/core-modules/application/application-asset/application-asset.controller';

const createMockStream = (): Readable => {
  const stream = new Readable();

  stream.push('file content');
  stream.push(null);
  stream.pipe = jest.fn();

  return stream;
};

const createMockResponse = () => ({
  setHeader: jest.fn(),
  redirect: jest.fn(),
});

describe('ApplicationAssetController', () => {
  let controller: ApplicationAssetController;
  let fileService: FileService;
  let applicationService: ApplicationService;
  let applicationRegistrationService: ApplicationRegistrationService;
  let twentyConfigService: TwentyConfigService;
  const mock_FileByIdGuard: CanActivate = { canActivate: jest.fn(() => true) };
  const mock_PublicEndpointGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };
  const mock_NoPermissionGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationAssetController],
      providers: [
        {
          provide: FileService,
          useValue: {
            getFileStreamById: jest.fn(),
            getFileStreamByPath: jest.fn(),
            getFileResponseById: jest.fn(),
          },
        },
        {
          provide: ApplicationService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ApplicationRegistrationService,
          useValue: {
            findOneByIdGlobal: jest.fn(),
            findApplicationByRegistrationId: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(FileByIdGuard)
      .useValue(mock_FileByIdGuard)
      .overrideGuard(PublicEndpointGuard)
      .useValue(mock_PublicEndpointGuard)
      .overrideGuard(NoPermissionGuard)
      .useValue(mock_NoPermissionGuard)
      .overrideFilter(FileApiExceptionFilter)
      .useValue({})
      .compile();

    controller = module.get<ApplicationAssetController>(
      ApplicationAssetController,
    );
    fileService = module.get<FileService>(FileService);
    applicationService = module.get<ApplicationService>(ApplicationService);
    applicationRegistrationService = module.get<ApplicationRegistrationService>(
      ApplicationRegistrationService,
    );
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPublicAssets', () => {
    it('should call fileService.getFileStreamByPath and pipe with headers', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileStreamByPath').mockResolvedValue({
        stream: mockStream,
        mimeType: 'image/png',
      });

      const mockRequest = {
        params: { path: ['images', 'logo.png'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await controller.getPublicAssets(
        mockResponse,
        mockRequest,
        'workspace-id',
        'app-id',
      );

      expect(fileService.getFileStreamByPath).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        applicationId: 'app-id',
        fileFolder: FileFolder.PublicAsset,
        filepath: 'images/logo.png',
      });
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'image/png',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'inline',
      );
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle single-segment path', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileStreamByPath').mockResolvedValue({
        stream: mockStream,
        mimeType: 'image/x-icon',
      });

      const mockRequest = {
        params: { path: ['favicon.ico'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await controller.getPublicAssets(
        mockResponse,
        mockRequest,
        'workspace-id',
        'app-id',
      );

      expect(fileService.getFileStreamByPath).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        applicationId: 'app-id',
        fileFolder: FileFolder.PublicAsset,
        filepath: 'favicon.ico',
      });
    });

    it('should throw FileException with FILE_NOT_FOUND when asset is not found', async () => {
      jest
        .spyOn(fileService, 'getFileStreamByPath')
        .mockRejectedValue(
          new FileStorageException(
            'File not found',
            FileStorageExceptionCode.FILE_NOT_FOUND,
          ),
        );

      const mockRequest = {
        params: { path: ['missing-asset.png'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await expect(
        controller.getPublicAssets(
          mockResponse,
          mockRequest,
          'workspace-id',
          'app-id',
        ),
      ).rejects.toThrow(
        new FileException('File not found', FileExceptionCode.FILE_NOT_FOUND),
      );
    });

    it('should throw FileException with INTERNAL_SERVER_ERROR for unexpected errors', async () => {
      jest
        .spyOn(fileService, 'getFileStreamByPath')
        .mockRejectedValue(new Error('Connection refused'));

      const mockRequest = {
        params: { path: ['broken-asset.png'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await expect(
        controller.getPublicAssets(
          mockResponse,
          mockRequest,
          'workspace-id',
          'app-id',
        ),
      ).rejects.toThrow(
        new FileException(
          'Error retrieving file: Connection refused',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getApplicationAsset', () => {
    it('should look up application and stream file with headers', async () => {
      const mockStream = createMockStream();

      jest.spyOn(applicationService, 'findById').mockResolvedValue({
        id: 'app-id',
        workspaceId: 'workspace-id',
      } as any);

      jest.spyOn(fileService, 'getFileStreamByPath').mockResolvedValue({
        stream: mockStream,
        mimeType: 'application/javascript',
      });

      const mockRequest = {
        params: { path: ['js', 'main.js'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await controller.getApplicationAsset(mockResponse, mockRequest, 'app-id');

      expect(applicationService.findById).toHaveBeenCalledWith('app-id');
      expect(fileService.getFileStreamByPath).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        applicationId: 'app-id',
        fileFolder: FileFolder.PublicAsset,
        filepath: 'js/main.js',
      });
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/javascript',
      );
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should throw NotFoundException when application is not found', async () => {
      jest.spyOn(applicationService, 'findById').mockResolvedValue(null);

      const mockRequest = {
        params: { path: ['logo.png'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await expect(
        controller.getApplicationAsset(mockResponse, mockRequest, 'unknown-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw FileException with FILE_NOT_FOUND when asset is not found', async () => {
      jest.spyOn(applicationService, 'findById').mockResolvedValue({
        id: 'app-id',
        workspaceId: 'workspace-id',
      } as any);

      jest
        .spyOn(fileService, 'getFileStreamByPath')
        .mockRejectedValue(
          new FileStorageException(
            'File not found',
            FileStorageExceptionCode.FILE_NOT_FOUND,
          ),
        );

      const mockRequest = {
        params: { path: ['missing.png'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await expect(
        controller.getApplicationAsset(mockResponse, mockRequest, 'app-id'),
      ).rejects.toThrow(
        new FileException('File not found', FileExceptionCode.FILE_NOT_FOUND),
      );
    });

    it('should throw FileException with INTERNAL_SERVER_ERROR for unexpected errors', async () => {
      jest.spyOn(applicationService, 'findById').mockResolvedValue({
        id: 'app-id',
        workspaceId: 'workspace-id',
      } as any);

      jest
        .spyOn(fileService, 'getFileStreamByPath')
        .mockRejectedValue(new Error('Disk failure'));

      const mockRequest = {
        params: { path: ['broken.png'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await expect(
        controller.getApplicationAsset(mockResponse, mockRequest, 'app-id'),
      ).rejects.toThrow(
        new FileException(
          'Error retrieving file: Disk failure',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getApplicationRegistrationAsset', () => {
    it('should redirect to CDN for NPM source type', async () => {
      jest
        .spyOn(applicationRegistrationService, 'findOneByIdGlobal')
        .mockResolvedValue({
          id: 'reg-id',
          sourceType: ApplicationRegistrationSourceType.NPM,
          sourcePackage: '@twenty/my-app',
          latestAvailableVersion: '1.2.3',
        } as any);

      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue('https://cdn.example.com');

      const mockRequest = {
        params: { path: ['assets', 'icon.svg'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await controller.getApplicationRegistrationAsset(
        mockResponse,
        mockRequest,
        'reg-id',
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'https://cdn.example.com/@twenty/my-app@1.2.3/assets/icon.svg',
      );
    });

    it('should stream file for TARBALL source type with ownerWorkspaceId', async () => {
      const mockStream = createMockStream();

      jest
        .spyOn(applicationRegistrationService, 'findOneByIdGlobal')
        .mockResolvedValue({
          id: 'reg-id',
          sourceType: ApplicationRegistrationSourceType.TARBALL,
          ownerWorkspaceId: 'owner-ws-id',
        } as any);

      jest
        .spyOn(
          applicationRegistrationService,
          'findApplicationByRegistrationId',
        )
        .mockResolvedValue({
          id: 'installed-app-id',
        } as any);

      jest.spyOn(fileService, 'getFileStreamByPath').mockResolvedValue({
        stream: mockStream,
        mimeType: 'text/css',
      });

      const mockRequest = {
        params: { path: ['styles', 'main.css'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await controller.getApplicationRegistrationAsset(
        mockResponse,
        mockRequest,
        'reg-id',
      );

      expect(
        applicationRegistrationService.findApplicationByRegistrationId,
      ).toHaveBeenCalledWith('reg-id', 'owner-ws-id');
      expect(fileService.getFileStreamByPath).toHaveBeenCalledWith({
        workspaceId: 'owner-ws-id',
        applicationId: 'installed-app-id',
        fileFolder: FileFolder.PublicAsset,
        filepath: 'styles/main.css',
      });
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/css',
      );
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should stream file for LOCAL source type with ownerWorkspaceId', async () => {
      const mockStream = createMockStream();

      jest
        .spyOn(applicationRegistrationService, 'findOneByIdGlobal')
        .mockResolvedValue({
          id: 'reg-id',
          sourceType: ApplicationRegistrationSourceType.LOCAL,
          ownerWorkspaceId: 'owner-ws-id',
        } as any);

      jest
        .spyOn(
          applicationRegistrationService,
          'findApplicationByRegistrationId',
        )
        .mockResolvedValue({
          id: 'local-app-id',
        } as any);

      jest.spyOn(fileService, 'getFileStreamByPath').mockResolvedValue({
        stream: mockStream,
        mimeType: 'image/png',
      });

      const mockRequest = {
        params: { path: ['icon.png'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await controller.getApplicationRegistrationAsset(
        mockResponse,
        mockRequest,
        'reg-id',
      );

      expect(fileService.getFileStreamByPath).toHaveBeenCalledWith({
        workspaceId: 'owner-ws-id',
        applicationId: 'local-app-id',
        fileFolder: FileFolder.PublicAsset,
        filepath: 'icon.png',
      });
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('should throw NotFoundException when no installed application found for TARBALL registration', async () => {
      jest
        .spyOn(applicationRegistrationService, 'findOneByIdGlobal')
        .mockResolvedValue({
          id: 'reg-id',
          sourceType: ApplicationRegistrationSourceType.TARBALL,
          ownerWorkspaceId: 'owner-ws-id',
        } as any);

      jest
        .spyOn(
          applicationRegistrationService,
          'findApplicationByRegistrationId',
        )
        .mockResolvedValue(null);

      const mockRequest = {
        params: { path: ['asset.js'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await expect(
        controller.getApplicationRegistrationAsset(
          mockResponse,
          mockRequest,
          'reg-id',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for unsupported source type', async () => {
      jest
        .spyOn(applicationRegistrationService, 'findOneByIdGlobal')
        .mockResolvedValue({
          id: 'reg-id',
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        } as any);

      const mockRequest = {
        params: { path: ['asset.js'] },
      } as any;

      const mockResponse = createMockResponse() as any;

      await expect(
        controller.getApplicationRegistrationAsset(
          mockResponse,
          mockRequest,
          'reg-id',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
