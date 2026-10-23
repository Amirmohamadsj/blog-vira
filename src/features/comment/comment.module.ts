import { Module } from '@nestjs/common';
import { CommentService } from './comment.service.js';
import { CommentController } from './comment.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../../core/entities/comment.entity.js';

@Module({
  imports:[TypeOrmModule.forFeature([Comment])],
  providers: [CommentService],
  controllers: [CommentController]
})
export class CommentModule {}
