import { Controller,Body,Post as HttpPost,Req,UseGuards, Inject, Get, Put, Delete, Param,ParseIntPipe, Patch } from '@nestjs/common';
import type { Request } from 'express';

import { PostsService } from './posts.service.js';
import { CreatePostModels } from '../../core/models/post-models/create-post.models.js';
import { UpdatePostModels } from '../../core/models/post-models/update-post.models.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';
import { Query } from '@nestjs/common';
import { QueryPostsModels } from '../../core/models/post-models/query-posts.models.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import {ApiTags,ApiOperation,ApiBearerAuth,ApiParam,ApiQuery,ApiBody,ApiResponse,} from '@nestjs/swagger';

type AuthenticatedRequest = Request & {
  user: AuthTokenPayload;
};

@ApiTags('Posts')
@Controller('posts')
export class PostsController {

    @Inject(PostsService)
    private readonly postService! : PostsService;


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create a post',
        description: 'Creates a new post for the authenticated user.',
    })
    @ApiBody({ type: CreatePostModels })
    @ApiResponse({ status: 201, description: 'Post created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
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


    @ApiOperation({
        summary: 'Get all published posts',
        description: 'Retrieves published posts with search, filtering and sorting options.',
    })
    @ApiResponse({ status: 200, description: 'Posts retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @Get()
    async getPosts(@Query() query : QueryPostsModels) {
      return this.postService.getPosts(query);
    }


    @ApiOperation({
        summary: 'Get post by ID',
        description: 'Retrieves a published post by its ID.',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Post retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid post ID.' })
    @ApiResponse({ status: 404, description: 'Post not found.' })
    @Get(':id')
    async getPost(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.postService.getPost(id);
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get all posts for admin',
        description: 'Retrieves all posts, including unpublished posts. Admin access only.',
    })
    @ApiResponse({ status: 200, description: 'Posts retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Admin access required.' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @Get('admin/all')
    getAllPostsForAdmin() {
        return this.postService.getAllPostsForAdmin();
    }


    
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get post by ID for admin',
        description: 'Retrieves a post by ID, including unpublished posts. Admin access only.',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Post retrieved successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid post ID.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'Admin access required.' })
    @ApiResponse({ status: 404, description: 'Post not found.' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @Get('admin/:id')
    getPostForAdmin(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.postService.getPostForAdmin(id);
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update a post',
        description: 'Updates an existing post. Only the author or an admin can modify it.',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdatePostModels })
    @ApiResponse({ status: 200, description: 'Post updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data or post ID.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'You are not allowed to update this post.' })
    @ApiResponse({ status: 404, description: 'Post not found.' })
    @UseGuards(AuthGuard)
    @Patch(':id')
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


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete a post',
        description: 'Deletes an existing post. Only the author or an admin can delete it.',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiResponse({ status: 200, description: 'Post deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid post ID.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiResponse({ status: 403, description: 'You are not allowed to delete this post.' })
    @ApiResponse({ status: 404, description: 'Post not found.' })
    @UseGuards(AuthGuard)
    @Delete(':id')
    async deletePost(
        @Param('id', ParseIntPipe) id: number,
        @Req() request:AuthenticatedRequest,
    ) {
        return this.postService.deletePost(id,request.user);
    }
}
