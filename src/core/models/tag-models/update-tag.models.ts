import { PartialType } from '@nestjs/swagger';
import { CreateTagModels } from './create-tag.models.js';

export class UpdateTagModels extends PartialType(CreateTagModels) {}