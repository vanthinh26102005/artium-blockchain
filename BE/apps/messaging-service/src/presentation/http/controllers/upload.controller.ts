import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GcsStorageService } from '../../../domain/services/gcs-storage.service';

@Controller('messaging')
export class UploadController {
  constructor(private readonly gcsStorage: GcsStorageService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/webm',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Invalid file type. Only images, videos, and documents are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload to Google Cloud Storage
    const result = await this.gcsStorage.uploadFile(file, {
      folder: 'messaging',
      makePublic: true,
    });

    // Determine file type for frontend
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    const isPdf = file.mimetype === 'application/pdf';

    return {
      url: result.url,
      filename: file.originalname,
      size: result.size,
      mimetype: file.mimetype,
      type: isImage ? 'IMAGE' : isVideo ? 'VIDEO' : isPdf ? 'FILE' : 'FILE',
      isImage,
      isVideo,
    };
  }
}
