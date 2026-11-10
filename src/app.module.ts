import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { UsersModule } from './features/users/users.module.js';
import { JwtModuleInfra } from './infra/jwt/jwt.module.js';
import { AuthModule } from './features/auth/auth.module.js';
import { PostsModule } from './features/posts/posts.module.js';
import { CategoryModule } from './features/category/category.module.js';
import { TagModule } from './features/tag/tag.module.js';
import { CommentModule } from './features/comment/comment.module.js';
import { MediaModule } from './features/media/media.module.js';
import { ViewModule } from './features/view/view.module.js';
import { BlockModule } from './features/block/block.module.js';
import { RedisCacheModule } from './infra/cache/redis-cache.module.js';
import { StorageModule } from './infra/storage/storage.module.js';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal : true
  }),
  TypeOrmModule.forRootAsync({
    imports : [ConfigModule],
    inject : [ConfigService],

    useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        autoLoadEntities: true,
        synchronize: false,
      }),

  }),
  UsersModule,
  JwtModuleInfra,
  AuthModule,
  PostsModule,
  CategoryModule,
  TagModule,
  CommentModule,
  MediaModule,
  ViewModule,
  BlockModule,
  RedisCacheModule,
  StorageModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
