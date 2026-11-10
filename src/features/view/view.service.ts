
import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { createHash, randomUUID } from 'node:crypto';
import { Repository, type SelectQueryBuilder } from 'typeorm';

import { View } from '../../core/entities/view.entity.js';
import { Post } from '../../core/entities/post.entity.js';
import { CacheService } from '../../core/cache/cache.service.js';
import type { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';
import { PostStatus } from '../../core/enum/post-status.enum.js';

type ViewRequest = Request & {
  user?: AuthTokenPayload;
  accessToken?: string;
};

type DateRange = {
  startDate?: string;
  endDate?: string;
};

@Injectable()
export class ViewService {
  @InjectRepository(View)
  private readonly viewRepository!: Repository<View>;

  @InjectRepository(Post)
  private readonly postRepository!: Repository<Post>;

  @Inject(CacheService)
  private readonly cacheService!: CacheService;

  private readonly analyticsCacheTtl = 60;

  async registerView(
    postId: number,
    request: ViewRequest,
  ): Promise<{ registered: boolean }> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      select: { id: true, status: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== PostStatus.PUBLISHED) {
      throw new NotFoundException('Published post not found');
    }

    const { visitorId, ttlSeconds } = this.getVisitor(request);
    const key = `views:post:${postId}:visitor:${visitorId}`;

    const isFirstView = await this.cacheService.setIfNotExists(
      key,
      '1',
      ttlSeconds,
    );

    if (!isFirstView) {
      return { registered: false };
    }

    try {
      await this.viewRepository.save(
        this.viewRepository.create({
          post: { id: postId } as Post,
        }),
      );
    } catch (error) {
      await this.cacheService.del(key);
      throw error;
    }

    await this.invalidateAnalyticsCache();

    return { registered: true };
  }

  private getVisitor(
    request: ViewRequest,
  ): { visitorId: string; ttlSeconds: number } {
    if (!request.user || !request.accessToken) {
      throw new UnauthorizedException('Authentication required');
    }

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

  private async getAnalyticsCacheKey(
    suffix: string,
  ): Promise<string> {
    const version =
      (await this.cacheService.get('analytics:version')) ?? 'initial';

    return `analytics:${version}:${suffix}`;
  }

  async getOverview(): Promise<{
    totalViews: number;
    totalPosts: number;
  }> {
    const cacheKey = await this.getAnalyticsCacheKey('overview');
    const cached = await this.cacheService.get(cacheKey);

    if (cached !== null) {
      return JSON.parse(cached) as {
        totalViews: number;
        totalPosts: number;
      };
    }

    const [totalViews, totalPosts] = await Promise.all([
      this.viewRepository.count(),
      this.postRepository.count({
        where: { status: PostStatus.PUBLISHED },
      }),
    ]);

    const result = { totalViews, totalPosts };

    await this.cacheService.set(
      cacheKey,
      JSON.stringify(result),
      this.analyticsCacheTtl,
    );

    return result;
  }

  async getPostStats(
    postId: number,
    range: DateRange = {},
  ): Promise<{ postId: number; totalViews: number }> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const { start, end } = this.parseDateRange(range);

    const cacheKey = await this.getAnalyticsCacheKey(
      `post:${postId}:${start?.toISOString() ?? ''}:${end?.toISOString() ?? ''}`,
    );

    const cached = await this.cacheService.get(cacheKey);

    if (cached !== null) {
      return JSON.parse(cached) as {
        postId: number;
        totalViews: number;
      };
    }

    const query = this.viewRepository
      .createQueryBuilder('view')
      .where('view.post_id = :postId', { postId });

    this.applyDateRange(query, start, end);

    const totalViews = await query.getCount();
    const result = { postId, totalViews };

    await this.cacheService.set(
      cacheKey,
      JSON.stringify(result),
      this.analyticsCacheTtl,
    );

    return result;
  }

  async getPopularPosts(
    range: DateRange = {},
  ): Promise<{ postId: number; title: string; totalViews: number }[]> {
    const { start, end } = this.parseDateRange(range);

    const cacheKey = await this.getAnalyticsCacheKey(
      `popular:${start?.toISOString() ?? ''}:${end?.toISOString() ?? ''}`,
    );

    const cached = await this.cacheService.get(cacheKey);

    if (cached !== null) {
      return JSON.parse(cached) as {
        postId: number;
        title: string;
        totalViews: number;
      }[];
    }

    const joinConditions: string[] = [];
    const joinParameters: Record<string, Date> = {};

    if (start) {
      joinConditions.push('view.createdAt >= :startDate');
      joinParameters.startDate = start;
    }

    if (end) {
      joinConditions.push('view.createdAt <= :endDate');
      joinParameters.endDate = end;
    }

    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoin(
        'post.views',
        'view',
        joinConditions.length > 0
          ? joinConditions.join(' AND ')
          : undefined,
        joinParameters,
      )
      .where('post.status = :status', {
        status: PostStatus.PUBLISHED,
      })
      .select('post.id', 'postId')
      .addSelect('post.title', 'title')
      .addSelect('COUNT(view.id)', 'totalViews')
      .groupBy('post.id')
      .addGroupBy('post.title')
      .orderBy('COUNT(view.id)', 'DESC')
      .addOrderBy('post.id', 'ASC')
      .limit(10);

    const rows = await query.getRawMany();

    const result = rows.map((row) => ({
      postId: Number(row.postId),
      title: row.title,
      totalViews: Number(row.totalViews),
    }));

    await this.cacheService.set(
      cacheKey,
      JSON.stringify(result),
      this.analyticsCacheTtl,
    );

    return result;
  }

  async getDailyViews(
    range: DateRange = {},
  ): Promise<{ date: string; totalViews: number }[]> {
    const { start, end } = this.parseDateRange(range);

    const cacheKey = await this.getAnalyticsCacheKey(
      `daily:${start?.toISOString() ?? ''}:${end?.toISOString() ?? ''}`,
    );

    const cached = await this.cacheService.get(cacheKey);

    if (cached !== null) {
      return JSON.parse(cached) as {
        date: string;
        totalViews: number;
      }[];
    }

    const query = this.viewRepository
      .createQueryBuilder('view')
      .select('DATE(view.createdAt)', 'date')
      .addSelect('COUNT(view.id)', 'totalViews')
      .groupBy('DATE(view.createdAt)')
      .orderBy('DATE(view.createdAt)', 'ASC');

    this.applyDateRange(query, start, end);

    const rows = await query.getRawMany();

    const result = rows.map((row) => ({
      date: String(row.date).slice(0, 10),
      totalViews: Number(row.totalViews),
    }));

    await this.cacheService.set(
      cacheKey,
      JSON.stringify(result),
      this.analyticsCacheTtl,
    );

    return result;
  }

  private parseDateRange(range: DateRange): {
    start?: Date;
    end?: Date;
  } {
    const start = range.startDate
      ? this.parseDate(range.startDate, 'startDate')
      : undefined;

    const end = range.endDate
      ? this.parseDate(range.endDate, 'endDate')
      : undefined;

    if (start && end && start > end) {
      throw new BadRequestException('Invalid date range');
    }

    return { start, end };
  }

  private parseDate(value: string, field: string): Date {
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const date = new Date(value);

    if (
      Number.isNaN(date.getTime()) ||
      (dateOnly && date.toISOString().slice(0, 10) !== value)
    ) {
      throw new BadRequestException(`Invalid ${field}`);
    }

    if (dateOnly && field === 'endDate') {
      date.setUTCHours(23, 59, 59, 999);
    }

    return date;
  }

  private applyDateRange(
    query: SelectQueryBuilder<View>,
    start?: Date,
    end?: Date,
  ): void {
    if (start) {
      query.andWhere('view.createdAt >= :startDate', {
        startDate: start,
      });
    }

    if (end) {
      query.andWhere('view.createdAt <= :endDate', {
        endDate: end,
      });
    }
  }

  private async invalidateAnalyticsCache(): Promise<void> {
    await this.cacheService.set(
      'analytics:version',
      randomUUID(),
      24 * 60 * 60,
    );
  }
}
