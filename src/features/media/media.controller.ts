import { Controller,Post,UseInterceptors,UploadedFile,ParseFilePipe,MaxFileSizeValidator,BadRequestException,UseGuards, Inject, Param, Res, Req, Get, ParseIntPipe, Delete,Patch,Body } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { MediaIdModel } from '../../core/models/media-models/media-id.model.js';
import { MediaService } from './media.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import type { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import type { AuthenticatedRequest } from '../../core/models/auth-models/authenticated-request.model.js';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';


@ApiTags('Media')
@Controller('media')

export class MediaController {

    @Inject(MediaService)
    private readonly mediaService: MediaService;


  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or file size exceeds 5 MB' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file' ,{limits : {
    fileSize : 5 * 1024 * 1024,
    files : 1,
  }}))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
        ],
        
        exceptionFactory: (error) =>
          new BadRequestException(error),
        }),
        )
            file: 
                {
                buffer: Buffer;
                originalname: string;
                mimetype: string;
                size: number;
            },
            @Req() request:AuthenticatedRequest,
          
            
        ) {
            return this.mediaService.upload(file, request.user.sub);
  }

  
  @Get(':id/access')
  async getAccess(
      @Param('id', ParseIntPipe) id: number,
      @Res() response: Response,
  ) {
      const url = await this.mediaService.getReadAccess(id);

      return response.redirect(302, url);
  }

  @ApiBearerAuth()
  @Patch('avatar')
  @UseGuards(AuthGuard)
  async updateAvatar(
    @Body() body: MediaIdModel,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    await this.mediaService.updateAvatar(
      request.user.sub,
      body.mediaId,
    );

    return { message: 'Avatar updated successfully' };
  }

  @ApiBearerAuth()
  @Post('posts/:postId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async attachToPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: MediaIdModel,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    await this.mediaService.attachToPost(
      request.user.sub,
      postId,
      body.mediaId,
    );

    return {
      message: 'Media attached to post successfully',
    };
  }


  @ApiBearerAuth()
  @Post('blocks/:blockId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async attachToBlock(
    @Param('blockId', ParseIntPipe) blockId: number,
    @Body() body: MediaIdModel,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    await this.mediaService.attachToBlock(
      request.user.sub,
      blockId,
      body.mediaId,
    );

    return {
      message: 'Media attached to block successfully',
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a media file (Admin only)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Media ID',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @Delete(':id')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('admin')  
  async  remove(
    @Param('id',ParseIntPipe) id : number,
  ): Promise<{message : string}> {
    await this.mediaService.remove(id);

    return {
      message : 'Media deleted successfully',
    }

  };

}
