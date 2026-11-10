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
import {ApiTags,ApiOperation,ApiBearerAuth,ApiParam,ApiBody,ApiResponse} from '@nestjs/swagger';

@ApiTags('Tags')
@Controller('tags')
export class TagController {
  @Inject(TagService)
  private readonly tagsService!: TagService;


    @ApiOperation({
        summary: 'Get all tags',
        description: 'Retrieves all available tags.',
    })
    @ApiResponse({ status: 200, description: 'Tags retrieved successfully.' })
    @Get()
    getTags() {
        return this.tagsService.getTags();
    }


    @ApiOperation({
        summary: 'Get tag by ID',
        description: 'Retrieves a tag by its ID.',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Tag retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid tag ID.' })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
    @Get(':id')
    getTag(
        @Param('id', ParseIntPipe) id: number,
    ){
        return this.tagsService.getTag(id);
    }



    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create a tag',
        description: 'Creates a new tag. Admin access only.',
    })
    @ApiBody({ type: CreateTagModels })
    @ApiResponse({ status: 201, description: 'Tag created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Admin access required.' })
    @ApiResponse({ status: 409, description: 'Tag already exists.' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    createTag(
        @Body() createTagModels: CreateTagModels,
    ){
        return this.tagsService.createTag(createTagModels);
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update a tag',
        description: 'Updates an existing tag. Admin access only.',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdateTagModels })
    @ApiResponse({ status: 200, description: 'Tag updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data or tag ID.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Admin access required.' })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
    @ApiResponse({ status: 409, description: 'Tag name or slug already exists.' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id')
    updateTag(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTagModels: UpdateTagModels,
    ){
       return this.tagsService.updateTag(id, updateTagModels);
    } 


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete a tag',
        description: 'Deletes a tag. Admin access only.',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiResponse({ status: 204, description: 'Tag deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid tag ID.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Admin access required.' })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
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