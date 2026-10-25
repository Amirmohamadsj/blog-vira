import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request, Response } from 'express';
import { randomUUID, createHash } from 'node:crypto';
import { Repository } from 'typeorm';

import { View } from '../../core/entities/view.entity.js';
import { Post } from '../../core/entities/post.entity.js';
import { CacheService } from '../../core/cache/cache.service.js';
import type { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';

type ViewRequest = Request & {
  user?: AuthTokenPayload;
  accessToken?: string;
};

@Injectable()
export class ViewService {
  @InjectRepository(View)
  private readonly viewRepository!: Repository<View>;

  @InjectRepository(Post)
  private readonly postRepository!: Repository<Post>;

  @Inject(CacheService)
  private readonly cacheService!: CacheService;

  async registerView(
    postId: number,
    request: ViewRequest,
    response: Response,
  ): Promise<{ registered: boolean }> {
    if (!(await this.postRepository.exists({ where: { id: postId } }))) {
      throw new NotFoundException('Post not found');
    }

    const { visitorId, ttlSeconds } = this.getVisitor(request, response);
    const key = `views:post:${postId}:visitor:${visitorId}`;

    if (!(await this.cacheService.setIfNotExists(key, '1', ttlSeconds))) {
      return { registered: false };
    }

    try {
      await this.viewRepository.save(
        this.viewRepository.create({ post: { id: postId } as Post }),
      );

      return { registered: true };
    } catch (error) {
      await this.cacheService.del(key);
      throw error;
    }
  }

  private getVisitor(
    request: ViewRequest,
    response: Response,
  ): { visitorId: string; ttlSeconds: number } {
    if (request.user && request.accessToken) {
      const ttlSeconds =
        (request.user.exp ?? 0) - Math.floor(Date.now() / 1000);

      if (ttlSeconds <= 0) {
        throw new UnauthorizedException('Token has expired');
      }

      return {
        visitorId: createHash('sha256')
          .update(request.accessToken)
          .digest('hex'),
        ttlSeconds,
      };
    }

    const cookieName = 'blog_visitor';
    const cookie = request.headers.cookie
      ?.split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${cookieName}=`));

    let visitorId = cookie?.slice(cookieName.length + 1);

    if (!visitorId) {
      visitorId = randomUUID();

      response.cookie(cookieName, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000,
      });
    }

    return {
      visitorId: createHash('sha256').update(visitorId).digest('hex'),
      ttlSeconds: 15 * 60,
    };
  }
}