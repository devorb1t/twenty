import { type CanActivate } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { Readable } from 'stream';

import { FileFolder } from 'twenty-shared/types';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import {
  FileException,
  FileExceptionCode,
} from 'src/engine/core-modules/file/file.exception';
import { FileApiExceptionFilter } from 'src/engine/core-modules/file/filters/file-api-exception.filter';
import { FileByIdGuard } from 'src/engine/core-modules/file/guards/file-by-id.guard';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

import { FileController } from './file.controller';

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

describe('FileController', () => {
  let controller: FileController;
  let fileService: FileService;
  const mock_FileByIdGuard: CanActivate = { canActivate: jest.fn(() => true) };
  const mock_PublicEndpointGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };
  const mock_NoPermissionGuard: CanActivate = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: {
            getFileStreamById: jest.fn(),
            getFileStreamByPath: jest.fn(),
            getFileResponseById: jest.fn(),
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

    controller = module.get<FileController>(FileController);
    fileService = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFileById', () => {
    it('should 302 redirect when presigned URL is available', async () => {
      jest.spyOn(fileService, 'getFileResponseById').mockResolvedValue({
        type: 'redirect',
        presignedUrl: 'https://s3.example.com/file?signed=abc',
      });

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse() as any;

      await controller.getFileById(
        mockResponse,
        mockRequest,
        FileFolder.Workflow,
        'file-123',
      );

      expect(fileService.getFileResponseById).toHaveBeenCalledWith({
        fileId: 'file-123',
        workspaceId: 'workspace-id',
        fileFolder: FileFolder.Workflow,
      });
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'https://s3.example.com/file?signed=abc',
      );
      expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });

    it('should stream with headers when no presigned URL (local driver)', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileResponseById').mockResolvedValue({
        type: 'stream',
        stream: mockStream,
        mimeType: 'image/png',
      });

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse() as any;

      await controller.getFileById(
        mockResponse,
        mockRequest,
        FileFolder.CorePicture,
        'file-123',
      );

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

    it('should force attachment disposition for non-safe MIME types', async () => {
      const mockStream = createMockStream();

      jest.spyOn(fileService, 'getFileResponseById').mockResolvedValue({
        type: 'stream',
        stream: mockStream,
        mimeType: 'text/html',
      });

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse() as any;

      await controller.getFileById(
        mockResponse,
        mockRequest,
        FileFolder.Workflow,
        'file-123',
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/html',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment',
      );
    });

    it('should throw FileException with FILE_NOT_FOUND when file is not found', async () => {
      jest
        .spyOn(fileService, 'getFileResponseById')
        .mockRejectedValue(
          new FileStorageException(
            'File not found',
            FileStorageExceptionCode.FILE_NOT_FOUND,
          ),
        );

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse() as any;

      await expect(
        controller.getFileById(
          mockResponse,
          mockRequest,
          FileFolder.FilesField,
          'missing-file',
        ),
      ).rejects.toThrow(
        new FileException('File not found', FileExceptionCode.FILE_NOT_FOUND),
      );
    });

    it('should throw FileException with INTERNAL_SERVER_ERROR for unexpected errors', async () => {
      jest
        .spyOn(fileService, 'getFileResponseById')
        .mockRejectedValue(new Error('Storage unavailable'));

      const mockRequest = { workspaceId: 'workspace-id' } as any;
      const mockResponse = createMockResponse() as any;

      await expect(
        controller.getFileById(
          mockResponse,
          mockRequest,
          FileFolder.Workflow,
          'file-456',
        ),
      ).rejects.toThrow(
        new FileException(
          'Error retrieving file: Storage unavailable',
          FileExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
