
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostModels } from './create-post.models.js';

export class UpdatePostModels extends PartialType(CreatePostModels) {}
