import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryModels } from './create-category.models.js';

export class UpdateCategoryModels extends PartialType(CreateCategoryModels) {}
