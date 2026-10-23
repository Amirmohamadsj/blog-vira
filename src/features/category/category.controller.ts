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
} from '@nestjs/common';

import { CategoriesService } from './category.service.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { UpdateCategoryModels } from '../../core/models/update-category.models.js';
import { CreateCategoryModels } from '../../core/models/create-category.models.js';

@Controller('categories')
export class CategoriesController {
  @Inject(CategoriesService)
  private readonly categoriesService!: CategoriesService;

  @Get()
  getCategories() {
    return this.categoriesService.getCategories();
  }

  @Get(':id')
  getCategory(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriesService.getCategory(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  createCategory(
    @Body() createCategoryModels: CreateCategoryModels,
  ) {
    return this.categoriesService.createCategory(createCategoryModels);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryModels: UpdateCategoryModels,
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryModels);
  }

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