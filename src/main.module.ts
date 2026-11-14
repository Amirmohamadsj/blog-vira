import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './features/users/users.module.js';
import { AuthModule } from './features/auth/auth.module.js';
import { PostsModule } from './features/posts/posts.module.js';
import { CategoryModule } from './features/category/category.module.js';
import { TagModule } from './features/tag/tag.module.js';
import { CommentModule } from './features/comment/comment.module.js';
import { MediaModule } from './features/media/media.module.js';
import { ViewModule } from './features/view/view.module.js';
import { BlockModule } from './features/block/block.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModuleInfra } from './infra/jwt/jwt.module.js';
import { RedisCacheModule } from './infra/cache/redis-cache.module.js';
import { StorageModule } from './infra/storage/storage.module.js';
import { DatabaseModule } from './infra/database/database.module.js';
import { LoggerModule } from './infra/logger/logger.module.js';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl:60_000,
        limit:10,
      }

    ]),
    DatabaseModule,
    LoggerModule,
    UsersModule,
    AuthModule,
    PostsModule,
    CategoryModule,
    TagModule,
    CommentModule,
    MediaModule,
    ViewModule,
    BlockModule,

    JwtModuleInfra,
    RedisCacheModule,
    StorageModule,
  ],
})
export class MainModule {}