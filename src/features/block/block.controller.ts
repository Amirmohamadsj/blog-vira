
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BlockService } from './block.service.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { CreateBlockModel } from '../../core/models/block-models/create-block.model.js';
import type { AuthenticatedRequest } from '../../core/models/auth-models/authenticated-request.model.js';
@ApiTags('Blocks')
@Controller('blocks')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class BlockController {
  @Inject(BlockService)
  private readonly blocksService!: BlockService;

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() model: Partial<CreateBlockModel>,
  ) {
    return this.blocksService.update(id, model);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blocksService.remove(id);
  }
}

@ApiTags('Blocks')
@Controller('posts/:postId/blocks')
@UseGuards(AuthGuard, RolesGuard)
export class PostBlocksController {
  @Inject(BlockService)
  private readonly blocksService!: BlockService;

  @Post()
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() model: CreateBlockModel,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.blocksService.create(
      postId,
      request.user.sub,
      request.user.role,
      model,
    );
  }

  @Get()
  @Roles('admin')
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.blocksService.findByPost(postId);
  }

  @Get('next')
  @Roles('admin')
  findNextBlocks(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('afterPosition', ParseIntPipe) afterPosition: number,
  ) {
    return this.blocksService.findNextBlocks(postId, afterPosition);
  }
}
