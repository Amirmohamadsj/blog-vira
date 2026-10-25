import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  Inject,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { ViewService } from './view.service.js';
import { OptionalAuthGuard } from '../../core/guards/optional-auth.guard.js';
import type { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';

type ViewRequest = Request & {
  user?: AuthTokenPayload;
  accessToken?: string;
};

@Controller('view')
export class ViewController {
  @Inject(ViewService)
  private readonly viewService!: ViewService;

  @Post('posts/:postId')
  @UseGuards(OptionalAuthGuard)
  async registerView(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: ViewRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.viewService.registerView(postId, request, response);
  }
}