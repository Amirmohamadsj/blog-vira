import {
  Injectable,
  NotFoundException,
  Inject,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Block } from '../../core/entities/block.entity.js';
import { Post } from '../../core/entities/post.entity.js';
import { Media } from '../../core/entities/media.entity.js';

import { CreateBlockModel } from '../../core/models/block-models/create-block.model.js';
import { UpdateBlockModel } from '../../core/models/block-models/update-block-model.js';

import { BlockType } from '../../core/enums/block-type.enum.js';
import { CacheService } from '../../core/cache/cache.service.js';

@Injectable()
export class BlockService {
  @InjectRepository(Block)
  private readonly blockRepository!: Repository<Block>;

  @InjectRepository(Post)
  private readonly postRepository!: Repository<Post>;

  @InjectRepository(Media)
  private readonly mediaRepository!: Repository<Media>;

  @Inject(CacheService)
  private readonly cacheService!: CacheService;

  private async getPost(postId: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  private checkPermission(
    post: Post,
    userId: number,
    role: 'user' | 'admin',
  ): void {
    if (role !== 'admin' && post.author.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to manage this post',
      );
    }
  }

  private async getBlock(id: number): Promise<Block> {
    const block = await this.blockRepository.findOne({
      where: { id },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return block;
  }

  private async validateMedia(mediaId: number): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
      select: { id: true },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }
  }

  private validateBlockData(
    type: BlockType,
    content: string,
    mediaId: number | null,
  ): void {
    if (
      [BlockType.TEXT, BlockType.HEADING, BlockType.CODE, BlockType.QUOTE]
        .includes(type) &&
      !content.trim()
    ) {
      throw new BadRequestException(
        'Content is required for this block type',
      );
    }

    if (type === BlockType.IMAGE && mediaId === null) {
      throw new BadRequestException(
        'Media is required for image blocks',
      );
    }
  }

    private async invalidateCache(postId: number): Promise<void> {
        try {
            await this.cacheService.del(`blocks:post:${postId}`);
        } catch {    }
    }

  private handleDatabaseError(error: unknown): never {
    if (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { driverError?: { code?: string } })
        .driverError?.code === '23505'
    ) {
      throw new BadRequestException(
        'A block with this position already exists',
      );
    }

    throw error;
  }

  async create(
    postId: number,
    userId: number,
    role: 'user' | 'admin',
    model: CreateBlockModel,
  ): Promise<Block> {
    const post = await this.getPost(postId);

    this.checkPermission(post, userId, role);

    const mediaId = model.mediaId ?? null;

    this.validateBlockData(model.type, model.content, mediaId);

    if (mediaId !== null) {
      await this.validateMedia(mediaId);
    }

    try {
      const block = this.blockRepository.create({
        postId,
        type: model.type,
        content: model.content,
        position: model.position,
        mediaId,
      });

      const savedBlock = await this.blockRepository.save(block);

      await this.invalidateCache(postId);

      return savedBlock;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async update(
    id: number,
    userId: number,
    role: 'user' | 'admin',
    model: UpdateBlockModel,
  ): Promise<Block> {
    const block = await this.getBlock(id);
    const post = await this.getPost(block.postId);

    this.checkPermission(post, userId, role);

    const nextType = model.type ?? block.type;
    const nextContent = model.content ?? block.content;

    const nextMediaId =
        model.mediaId !== undefined
            ? model.mediaId
            : model.type !== undefined && model.type !== block.type
            ? null
            : block.mediaId;

    this.validateBlockData(
      nextType,
      nextContent,
      nextMediaId,
    );

    if (model.mediaId !== undefined && model.mediaId !== null) {
      await this.validateMedia(model.mediaId);
    }

    if (model.type !== undefined) {
      block.type = model.type;
    }

    if (model.content !== undefined) {
      block.content = model.content;
    }

    if (model.position !== undefined) {
      block.position = model.position;
    }

    if (model.mediaId !== undefined) {
      block.mediaId = model.mediaId;
    }

    try {
      const updatedBlock = await this.blockRepository.save(block);

      await this.invalidateCache(block.postId);

      return updatedBlock;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findNextBlocks(
    postId: number,
    afterPosition: number,
  ): Promise<Block[]> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.blockRepository
      .createQueryBuilder('block')
      .where('block.postId = :postId', { postId })
      .andWhere('block.position > :afterPosition', {
        afterPosition,
      })
      .orderBy('block.position', 'ASC')
      .take(4)
      .getMany();
  }

  async remove(
    id: number,
    userId: number,
    role: 'user' | 'admin',
  ): Promise<void> {
    const block = await this.getBlock(id);
    const post = await this.getPost(block.postId);

    this.checkPermission(post, userId, role);

    await this.blockRepository.remove(block);

    await this.invalidateCache(block.postId);
  }

  async findByPost(postId: number): Promise<Block[]> {
    const cacheKey = `blocks:post:${postId}`;

    const cachedBlocks = await this.cacheService.get(cacheKey);

    if (cachedBlocks !== null) {
      return JSON.parse(cachedBlocks) as Block[];
    }

    const post = await this.postRepository.findOne({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const blocks = await this.blockRepository.find({
      where: { postId },
      order: { position: 'ASC' },
    });

    await this.cacheService.set(
      cacheKey,
      JSON.stringify(blocks),
      60,
    );

    return blocks;
  }
}