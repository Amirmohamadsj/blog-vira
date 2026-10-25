import { Controller,Post,UseInterceptors,UploadedFile,ParseFilePipe,MaxFileSizeValidator,BadRequestException,UseGuards, Inject, Param, Res, Req, StreamableFile, Get, ParseIntPipe, Delete } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { MediaService } from './media.service.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import type { Response } from 'express';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import type { AuthenticatedRequest } from '../../core/models/auth-models/authenticated-request.model.js';


@Controller('media')

export class MediaController {

    @Inject(MediaService)
    private readonly mediaService: MediaService;


    
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

  @Delete(':id')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('admin')  async  remove(
    @Param('id',ParseIntPipe) id : number,
  ): Promise<{message : string}> {
    await this.mediaService.remove(id);

    return {
      message: 'Media deleted successfully',
    }

  };

}
