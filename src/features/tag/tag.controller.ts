import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
} from '@nestjs/common';

import { TagService } from './tag.service.js';
import { CreateTagModels } from '../../core/models/tag-models/create-tag.models.js';
import { UpdateTagModels } from '../../core/models/tag-models/update-tag.models.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';

@Controller('tags')
export class TagController {
  @Inject(TagService)
  private readonly tagsService!: TagService;

    @Get()
    getTags() {
        return this.tagsService.getTags();
    }

    @Get(':id')
    getTag(
        @Param('id', ParseIntPipe) id: number,
    ){
        return this.tagsService.getTag(id);
    }


    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    createTag(
        @Body() createTagModels: CreateTagModels,
    ){
        return this.tagsService.createTag(createTagModels);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id')
    updateTag(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTagModels: UpdateTagModels,
    ){
       return this.tagsService.updateTag(id, updateTagModels);
    } 


    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteTag(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.tagsService.deleteTag(id);
    }



}