import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Inject,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { ViewService } from './view.service.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import type { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';
import {ApiTags,ApiOperation,ApiBearerAuth,ApiParam,ApiQuery,ApiResponse} from '@nestjs/swagger';


type ViewRequest = Request & {
  user?: AuthTokenPayload;
  accessToken?: string;
};

@ApiTags('Analytics')
@Controller('analytics')
export class ViewController {
  @Inject(ViewService)
  private readonly viewService!: ViewService;


  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a post view' })
  @ApiParam({
    name: 'postId',
    type: Number,
    description: 'Post ID',
    example: 1,
  })
  @ApiResponse({ status: 201, description: 'View registered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @Post('posts/:postId/views')
  @UseGuards(AuthGuard)
  async registerView(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: ViewRequest,
  ) {
    return this.viewService.registerView(postId, request);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics overview (Admin only)' })
  @ApiResponse({ status: 200, description: 'Analytics overview retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @Get('overview')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getOverview() {
    return this.viewService.getOverview();
  }


  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get popular posts (Admin only)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2026-11-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2026-11-10' })
  @ApiResponse({ status: 200, description: 'Popular posts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @Get('posts/popular')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getPopularPosts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.viewService.getPopularPosts({ startDate, endDate });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics for a specific post (Admin only)' })
  @ApiParam({
    name: 'postId',
    type: Number,
    description: 'Post ID',
    example: 1,
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2026-11-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2026-11-10' })
  @ApiResponse({ status: 200, description: 'Post statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @Get('posts/:postId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getPostStats(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.viewService.getPostStats(postId, {
      startDate,
      endDate,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get daily views statistics (Admin only)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2026-11-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2026-11-10' })
  @ApiResponse({ status: 200, description: 'Daily views retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @Get('views/daily')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getDailyViews(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.viewService.getDailyViews({ startDate, endDate });
  }
}
