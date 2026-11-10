import { Module } from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../core/entities/post.entity.js';
import { Category } from '../../core/entities/category.entity.js';
import { Tag } from '../../core/entities/tag.entity.js';
import { Media } from '../../core/entities/media.entity.js';
import { User } from '../../core/entities/user.entity.js';
import { JwtModuleInfra } from '../../infra/jwt/jwt.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RedisCacheModule } from '../../infra/cache/redis-cache.module.js';

@Module({
  imports:[TypeOrmModule.forFeature([Post,Category,Tag,Media,User]),
  JwtModuleInfra,AuthModule,RedisCacheModule
  
],
  providers: [PostsService,AuthGuard],
  controllers: [PostsController],
  exports:[PostsService]
})
export class PostsModule {}
