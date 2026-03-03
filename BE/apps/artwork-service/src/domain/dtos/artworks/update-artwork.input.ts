import { PartialType } from '@nestjs/swagger';
import { CreateArtworkInput } from './create-artwork.input';

export class UpdateArtworkInput extends PartialType(CreateArtworkInput) {}
