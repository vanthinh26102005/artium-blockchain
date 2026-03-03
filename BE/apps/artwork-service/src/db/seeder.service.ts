import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag, Artwork, ArtworkFolder } from '../domain';
import {
  artworksSeed,
  artworkFoldersSeed,
  artworkFolderAssignments,
  tagsSeed,
} from './seeds/artworks.seed';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
    @InjectRepository(ArtworkFolder)
    private readonly artworkFolderRepository: Repository<ArtworkFolder>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async seed() {
    // Step 1: Create tags first (may be needed for artworks)
    for (const tag of tagsSeed) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: tag.name },
      });
      if (!existingTag) {
        await this.tagRepository.save(this.tagRepository.create(tag));
      }
    }

    // Step 2: Create artworks first (without folder assignment)
    for (const artwork of artworksSeed) {
      const existingArtwork = await this.artworkRepository.findOne({
        where: { title: artwork.title, sellerId: artwork.sellerId },
      });
      if (!existingArtwork) {
        await this.artworkRepository.save(
          this.artworkRepository.create(artwork),
        );
      }
    }

    // Step 3: Create folders after artworks
    for (const folder of artworkFoldersSeed) {
      const existingFolder = await this.artworkFolderRepository.findOne({
        where: { name: folder.name, sellerId: folder.sellerId },
      });
      if (!existingFolder) {
        await this.artworkFolderRepository.save(
          this.artworkFolderRepository.create(folder),
        );
      }
    }

    // Step 4: Assign artworks to folders based on the mapping
    for (const assignment of artworkFolderAssignments) {
      const artwork = await this.artworkRepository.findOne({
        where: { title: assignment.artworkTitle },
      });
      const folder = await this.artworkFolderRepository.findOne({
        where: { name: assignment.folderName },
      });

      if (artwork && folder && artwork.folderId !== folder.id) {
        artwork.folderId = folder.id;
        await this.artworkRepository.save(artwork);
      }
    }
  }
}
