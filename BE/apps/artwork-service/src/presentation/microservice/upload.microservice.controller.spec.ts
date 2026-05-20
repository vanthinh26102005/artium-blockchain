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
  const sellerId = '1149d95e-24fb-42c6-bbec-d1c2f4f0f7be';
  const otherSellerId = '2149d95e-24fb-42c6-bbec-d1c2f4f0f7be';
  const draftArtworkId = 'a2379c6e-c19f-40d6-a94c-806b81417387';

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
        sellerId,
        artworkId: draftArtworkId,
        file: undefined as never,
      }),
    ).rejects.toThrow();
    expect(gcsStorage.uploadFile).not.toHaveBeenCalled();
  });

  it('rejects uploads for missing draft', async () => {
    artworkRepo.findById.mockResolvedValue(null as never);

    await expect(
      controller.uploadArtworkImage({
        sellerId,
        artworkId: draftArtworkId,
        file,
      }),
    ).rejects.toThrow();
    expect(gcsStorage.uploadFile).not.toHaveBeenCalled();
  });

  it("rejects uploads for another seller's draft", async () => {
    artworkRepo.findById.mockResolvedValue({
      id: 'draft-1',
      sellerId: otherSellerId,
      status: ArtworkStatus.DRAFT,
    } as never);

    await expect(
      controller.uploadArtworkImage({
        sellerId,
        artworkId: draftArtworkId,
        file,
      }),
    ).rejects.toThrow();
    expect(gcsStorage.uploadFile).not.toHaveBeenCalled();
  });

  it('rejects uploads for non-draft artwork', async () => {
    artworkRepo.findById.mockResolvedValue({
      id: 'draft-1',
      sellerId,
      status: ArtworkStatus.ACTIVE,
    } as never);

    await expect(
      controller.uploadArtworkImage({
        sellerId,
        artworkId: draftArtworkId,
        file,
      }),
    ).rejects.toThrow();
    expect(gcsStorage.uploadFile).not.toHaveBeenCalled();
  });

  it('rejects non-UUID artwork ids before querying the repository', async () => {
    await expect(
      controller.uploadArtworkImage({
        sellerId,
        artworkId: 'event-a2379c6e-c19f-40d6-a94c-806b81417387',
        file,
      }),
    ).rejects.toThrow();
    expect(artworkRepo.findById).not.toHaveBeenCalled();
    expect(gcsStorage.uploadFile).not.toHaveBeenCalled();
  });

  it('uploads seller-owned draft image with draft metadata', async () => {
    artworkRepo.findById.mockResolvedValue({
      id: draftArtworkId,
      sellerId,
      status: ArtworkStatus.DRAFT,
    } as never);
    gcsStorage.uploadFile.mockResolvedValue({
      publicId: `artworks/${sellerId}/${draftArtworkId}/image.webp`,
      url: 'https://cdn.example/image.webp',
      secureUrl: 'https://cdn.example/image.webp',
      bucket: 'artium',
    } as never);

    const result = await controller.uploadArtworkImage({
      sellerId,
      artworkId: draftArtworkId,
      file,
      altText: 'Front view',
      order: 1,
      isPrimary: true,
    });

    expect(gcsStorage.uploadFile).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        folder: `artworks/${sellerId}/${draftArtworkId}`,
        metadata: expect.objectContaining({
          sellerId,
          artworkId: draftArtworkId,
          uploadedBy: 'artwork-service',
        }),
      }),
    );
    expect(result).toMatchObject({
      publicId: `artworks/${sellerId}/${draftArtworkId}/image.webp`,
      altText: 'Front view',
      order: 1,
      isPrimary: true,
    });
  });

  it('uploads event cover images without artwork draft validation', async () => {
    gcsStorage.uploadFile.mockResolvedValue({
      publicId: `events/${sellerId}/event-1/image.webp`,
      url: 'https://cdn.example/event.webp',
      secureUrl: 'https://cdn.example/event.webp',
      bucket: 'artium',
    } as never);

    const result = await controller.uploadEventCoverImage({
      ownerId: sellerId,
      eventId: 'event-1',
      file,
      altText: 'Opening night',
    });

    expect(artworkRepo.findById).not.toHaveBeenCalled();
    expect(gcsStorage.uploadFile).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        folder: `events/${sellerId}/event-1`,
        metadata: expect.objectContaining({
          ownerId: sellerId,
          eventId: 'event-1',
          uploadContext: 'event-cover',
        }),
      }),
    );
    expect(result).toMatchObject({
      secureUrl: 'https://cdn.example/event.webp',
      altText: 'Opening night',
      isPrimary: true,
    });
  });
});
