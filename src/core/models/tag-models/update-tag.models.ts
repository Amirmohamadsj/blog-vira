import { PartialType } from '@nestjs/mapped-types';
import { CreateTagModels } from './create-tag.models.js';

export class UpdateTagModels extends PartialType(CreateTagModels) {}