import { PartialType } from '@nestjs/swagger';
import { CreateCategoryModels } from './create-category.models.js';

export class UpdateCategoryModels extends PartialType(CreateCategoryModels) {}
