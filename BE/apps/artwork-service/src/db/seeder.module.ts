import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Tag, Artwork, ArtworkFolder } from '../domain';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork, ArtworkFolder, Tag])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
