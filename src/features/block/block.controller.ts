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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';


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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a block (Admin only)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: CreateBlockModel })
  @ApiResponse({ status: 200, description: 'Block updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Block not found' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() model: Partial<CreateBlockModel>,
  ) {
    return this.blocksService.update(id, model);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a block (Admin only)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Block deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Block not found' })
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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a block for a post' })
  @ApiParam({ name: 'postId', type: Number, example: 1 })
  @ApiBody({ type: CreateBlockModel })
  @ApiResponse({ status: 201, description: 'Block created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid block data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all blocks of a post (Admin only)' })
  @ApiParam({ name: 'postId', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Blocks retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @Get()
  @Roles('admin')
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.blocksService.findByPost(postId);
  }


  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get next blocks of a post (Admin only)' })
  @ApiParam({ name: 'postId', type: Number, example: 1 })
  @ApiQuery({
    name: 'afterPosition',
    required: true,
    type: Number,
    example: 3,
    description: 'Return blocks after this position',
  })
  @ApiResponse({ status: 200, description: 'Next blocks retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid position' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @Get('next')
  @Roles('admin')
  findNextBlocks(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('afterPosition', ParseIntPipe) afterPosition: number,
  ) {
    return this.blocksService.findNextBlocks(postId, afterPosition);
  }
}
