import { Injectable, NotFoundException,Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Block } from '../../core/entities/block.entity.js';
import { Repository } from 'typeorm';
import { Post } from '../../core/entities/post.entity.js';
import { CreateBlockModel } from '../../core/models/create-block.model.js';
import { CacheService } from '../../core/cache/cache.service.js';

@Injectable()
export class BlockService {

    @InjectRepository(Block)
    private readonly blockRepository! : Repository<Block>;

    @InjectRepository(Post)
    private readonly postRepository! : Repository<Post>;

    @Inject(CacheService)
    private readonly cacheService!: CacheService;

    async create(
        model : CreateBlockModel
    ):Promise<Block>{
        const post = await this.postRepository.findOne({
            where: { id: model.postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const block = this.blockRepository.create({
            postId: model.postId,
            type: model.type,
            content: model.content,
            position: model.position,
        });

        const savedBlock = await this.blockRepository.save(block)

        await this.cacheService.del(`blocks:post:${savedBlock.postId}`);

        return savedBlock;
    }


    async findByPost(postId: number): Promise<Block[]> {
        const cacheKey = `blocks:post:${postId}`;
        const cachedBlocks = await this.cacheService.get(cacheKey);

        if(cachedBlocks !== null){
            return JSON.parse(cachedBlocks) as Block[]
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
        )

        return blocks;
    }


    async update(
        id : number,
        model : Partial<CreateBlockModel>,
    ):Promise<Block>{
        const block = await this.blockRepository.findOne({
            where: { id },
        });


        if (!block) {
            throw new NotFoundException('Block not found');
        }

        const oldPostId = block.postId;

        if (model.postId !== undefined){
            const post = await this.postRepository.findOne({
                where : {id : model.postId},
                select : {id : true}
            });

            if (!post) {
                throw new NotFoundException('Post not found');
            }

            block.postId = model.postId;
        }

        if(model.type !== undefined){
            block.type = model.type;
        }

        if(model.content !== undefined){
            block.content = model.content
        }

        if (model.position !== undefined) {
            block.position = model.position;
        }

        block.lastEdit = new Date();

        

        const updatedBlock= await this.blockRepository.save(block);

        await this.cacheService.del(`blocks:post:${oldPostId}`);

        if (updatedBlock.postId !== oldPostId) {
            await this.cacheService.del(
                `blocks:post:${updatedBlock.postId}`,
            );
        }

        return updatedBlock;
        
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
}
