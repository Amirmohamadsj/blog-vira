import { Controller,Post,UseInterceptors,UploadedFile,ParseFilePipe,MaxFileSizeValidator,BadRequestException,UseGuards, Inject, Param, Res, Req, StreamableFile, Get, ParseIntPipe, Delete } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(FileInterceptor('file'))
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
            return this.mediaService.upload(file);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download a media file' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Media ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'File retrieved successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @Get(':id')
  @UseGuards(AuthGuard)
  async getFile(
    @Param('id',ParseIntPipe) id : number,
    @Res({passthrough : true}) response : Response,
  ):Promise<StreamableFile>{

    const file = await this.mediaService.getFile(id);

    response.set({
      'Content-Type' : file.contentType ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,

    });


    return new StreamableFile(file.body)
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
      message: 'Media deleted successfully',
    }

  };

}
