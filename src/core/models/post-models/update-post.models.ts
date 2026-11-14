import { PartialType } from '@nestjs/swagger';
import { CreatePostModels } from './create-post.models.js';

export class UpdatePostModels extends PartialType(CreatePostModels) {}