import { Controller,Body,Post as HttpPost,Req,UseGuards, Inject, Get, Put, Delete, Param,ParseIntPipe } from '@nestjs/common';
import type { Request } from 'express';

import { PostsService } from './posts.service.js';
import { CreatePostModels } from '../../core/models/create-post.models.js';
import { UpdatePostModels } from '../../core/models/update-post.models.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';
import { Query } from '@nestjs/common';
import { QueryPostsModels } from '../../core/models/query-posts.models.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';

type AuthenticatedRequest = Request & {
  user: AuthTokenPayload;
};

@Controller('posts')
export class PostsController {

    @Inject(PostsService)
    private readonly postService! : PostsService;

    @UseGuards(AuthGuard)
    @HttpPost()
    async createPost(
        @Body() createPostModels : CreatePostModels,
        @Req() request:AuthenticatedRequest,
    ){
        return this.postService.createPost(
            createPostModels,
            request.user.sub,
        );
    }

    @Get()
    async getPosts(@Query() query : QueryPostsModels) {
      return this.postService.getPosts(query);
    }

    @Get(':id')
    async getPost(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.postService.getPost(id);
    }


    @UseGuards(AuthGuard)
    @Put(':id')
    async updatePost(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePostModels: UpdatePostModels,
        @Req() request : AuthenticatedRequest,
    ) {
        return this.postService.updatePost(
        id,
        updatePostModels,
        request.user,

        );
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async deletePost(
        @Param('id', ParseIntPipe) id: number,
        @Req() request:AuthenticatedRequest,
    ) {
        return this.postService.deletePost(id,request.user);
    }
}
