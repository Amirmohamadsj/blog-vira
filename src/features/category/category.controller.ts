import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Inject,
  Patch,
} from '@nestjs/common';

import { CategoriesService } from './category.service.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { UpdateCategoryModels } from '../../core/models/categroy-models/update-category.models.js';
import { CreateCategoryModels } from '../../core/models/categroy-models//create-category.models.js';
import {ApiTags,ApiOperation,ApiBearerAuth,ApiParam,ApiBody,ApiResponse} from '@nestjs/swagger';


@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  @Inject(CategoriesService)
  private readonly categoriesService!: CategoriesService;


  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieves all available categories.',
  })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully.' })
  @Get()
  getCategories() {
    return this.categoriesService.getCategories();
  }

  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieves a category by its ID.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid category ID.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @Get(':id')
  getCategory(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriesService.getCategory(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a category',
    description: 'Creates a new category. Admin access only.',
  })
  @ApiBody({ type: CreateCategoryModels })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
  @ApiResponse({ status: 409, description: 'Category already exists.' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  createCategory(
    @Body() createCategoryModels: CreateCategoryModels,
  ) {
    return this.categoriesService.createCategory(createCategoryModels);
  }


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a category',
    description: 'Updates an existing category. Admin access only.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateCategoryModels })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data or category ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 409, description: 'Category name or slug already exists.' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryModels: UpdateCategoryModels,
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryModels);
  }


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a category',
    description: 'Deletes a category. Admin access only.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid category ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.categoriesService.deleteCategory(id);
  }
}