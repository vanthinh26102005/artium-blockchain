import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ArtworkStatus } from '@app/common';
import { UploadMicroserviceController } from './upload.microservice.controller';

describe('UploadMicroserviceController', () => {
  const gcsStorage = {
    uploadFile: jest.fn(),
  };
  const artworkRepo = {
    findById: jest.fn(),
  };

  const file = {
    originalname: 'front.jpg',
    size: 1024,
  } as Express.Multer.File;

  let controller: UploadMicroserviceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UploadMicroserviceController(
      gcsStorage as never,
      artworkRepo as never,
    );
  });

  it('rejects uploads without a file', async () => {
    await expect(
      controller.uploadArtworkImage({
        sellerId: 'seller-1',
        artworkId: 'draft-1',
        file: undefined as never,
      }),
    ).rejects.toThrow();
    expect(gcsStorage.uploadFile).not.toHaveBeenCalled();
  });

  it('rejects uploads for missing draft', async () => {
    artworkRepo.findById.mockResolvedValue(null as never);

    await expect(
      controller.uploadArtworkImage({
        sellerId: 'seller-1',
        artworkId: 'draft-1',
        file,
      }),
    ).rejects.toThrow();
    expect(gcsStorage.uploadFile).not.toHaveBeenCalled();
  });

  it("rejects uploads for another seller's draft", async () => {
    artworkRepo.findById.mockResolvedValue({
      id: 'draft-1',
      sellerId: 'seller-2',
      status: ArtworkStatus.DRAFT,
    } as never);

    await expect(
      controller.uploadArtworkImage({
        sellerId: 'seller-1',
        artworkId: 'draft-1',
        file,
      }),
    ).rejects.toThrow();
    expect(gcsStorage.uploadFile).not.toHaveBeenCalled();
  });

  it('rejects uploads for non-draft artwork', async () => {
    artworkRepo.findById.mockResolvedValue({
      id: 'draft-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.ACTIVE,
    } as never);

    await expect(
      controller.uploadArtworkImage({
        sellerId: 'seller-1',
        artworkId: 'draft-1',
        file,
      }),
    ).rejects.toThrow();
    expect(gcsStorage.uploadFile).not.toHaveBeenCalled();
  });

  it('uploads seller-owned draft image with draft metadata', async () => {
    artworkRepo.findById.mockResolvedValue({
      id: 'draft-1',
      sellerId: 'seller-1',
      status: ArtworkStatus.DRAFT,
    } as never);
    gcsStorage.uploadFile.mockResolvedValue({
      publicId: 'artworks/seller-1/draft-1/image.webp',
      url: 'https://cdn.example/image.webp',
      secureUrl: 'https://cdn.example/image.webp',
      bucket: 'artium',
    } as never);

    const result = await controller.uploadArtworkImage({
      sellerId: 'seller-1',
      artworkId: 'draft-1',
      file,
      altText: 'Front view',
      order: 1,
      isPrimary: true,
    });

    expect(gcsStorage.uploadFile).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        folder: 'artworks/seller-1/draft-1',
        metadata: expect.objectContaining({
          sellerId: 'seller-1',
          artworkId: 'draft-1',
          uploadedBy: 'artwork-service',
        }),
      }),
    );
    expect(result).toMatchObject({
      publicId: 'artworks/seller-1/draft-1/image.webp',
      altText: 'Front view',
      order: 1,
      isPrimary: true,
    });
  });
});
