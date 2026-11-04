
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

type ViewRequest = Request & {
  user?: AuthTokenPayload;
  accessToken?: string;
};

@Controller('analytics')
export class ViewController {
  @Inject(ViewService)
  private readonly viewService!: ViewService;

  @Post('posts/:postId/views')
  @UseGuards(AuthGuard)
  async registerView(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: ViewRequest,
  ) {
    return this.viewService.registerView(postId, request);
  }

  @Get('overview')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getOverview() {
    return this.viewService.getOverview();
  }

  @Get('posts/popular')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getPopularPosts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.viewService.getPopularPosts({ startDate, endDate });
  }

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
