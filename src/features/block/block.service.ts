import { Injectable, NotFoundException,Inject,ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Block } from '../../core/entities/block.entity.js';
import { Repository } from 'typeorm';
import { Post } from '../../core/entities/post.entity.js';
import { CreateBlockModel } from '../../core/models/block-models/create-block.model.js';
import { CacheService } from '../../core/cache/cache.service.js';
import { Media } from '../../core/entities/media.entity.js';
@Injectable()
export class BlockService {

    @InjectRepository(Block)
    private readonly blockRepository! : Repository<Block>;

    @InjectRepository(Post)
    private readonly postRepository! : Repository<Post>;

    @Inject(CacheService)
    private readonly cacheService!: CacheService;

    @InjectRepository(Media)
    private readonly mediaRepository!: Repository<Media>;

    async create(
        postId: number,
        userId: number,
        role: 'user' | 'admin',
        model: CreateBlockModel,
    ): Promise<Block> {
        const post = await this.postRepository.findOne({
            where: { id: postId },
            select: {
            id: true,
            author: {
                id : true
             },
            },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (role !== 'admin' && post.author.id !== userId) {
            throw new ForbiddenException(
            'You are not allowed to manage this post',
            );
        }

        let mediaId: number | null = model.mediaId ?? null;

        if (mediaId !== null) {
            const media = await this.mediaRepository.findOne({
            where: { id: mediaId },
            select: { id: true },
            });

            if (!media) {
                throw new NotFoundException('Media not found');
            }
        }

        const block = this.blockRepository.create({
            postId,
            type: model.type,
            content: model.content,
            position: model.position,
            mediaId,
        });

        const savedBlock = await this.blockRepository.save(block);

        await this.cacheService.del(`blocks:post:${postId}`);

        return savedBlock;
    }


    
    async update(
        id: number,
        model: Partial<CreateBlockModel>,
    ): Promise<Block> {
        const block = await this.blockRepository.findOne({
            where: { id },
        });

        if (!block) {
            throw new NotFoundException('Block not found');
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
            if (model.mediaId === null) {
            block.mediaId = null;
            } else {
            const media = await this.mediaRepository.findOne({
                where: { id: model.mediaId },
                select: { id: true },
            });

            if (!media) {
                throw new NotFoundException('Media not found');
            }

            block.mediaId = media.id;
            }
        }

        block.lastEdit = new Date();

        const updatedBlock = await this.blockRepository.save(block);

        await this.cacheService.del(`blocks:post:${block.postId}`);

        return updatedBlock;
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
            .getMany();
    }

    async remove(id: number): Promise<void> {
        const block = await this.blockRepository.findOne({
            where: { id },
        });

        if (!block) {
            throw new NotFoundException('Block not found');
        }

        await this.blockRepository.remove(block);

        await this.cacheService.del(`blocks:post:${block.postId}`);
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

        await this.cacheService.set(cacheKey, JSON.stringify(blocks), 60);

        return blocks;
    }
}
