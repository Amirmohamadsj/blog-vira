import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlockService } from './block.service.js';
import {
  BlockController,
  PostBlocksController,
} from './block.controller.js';

import { Block } from '../../core/entities/block.entity.js';
import { Post } from '../../core/entities/post.entity.js';
import { Media } from '../../core/entities/media.entity.js';

import { JwtModuleInfra } from '../../infra/jwt/jwt.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { RedisCacheModule } from '../../infra/cache/redis-cache.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Block, Post, Media]),
    JwtModuleInfra,
    AuthModule,
    RedisCacheModule,
  ],
  controllers: [
    BlockController,
    PostBlocksController,
  ],
  providers: [BlockService],
  exports: [BlockService],
})
export class BlockModule {}