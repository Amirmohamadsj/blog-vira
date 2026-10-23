import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { BlockService } from './block.service.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { CreateBlockModel } from '../../core/models/create-block.model.js';

@Controller('blocks')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class BlockController {
  constructor(private readonly blocksService: BlockService) {}

  @Post()
  create(@Body() model: CreateBlockModel) {
    return this.blocksService.create(model);
  }

  @Get('post/:postId')
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.blocksService.findByPost(postId);
  }

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