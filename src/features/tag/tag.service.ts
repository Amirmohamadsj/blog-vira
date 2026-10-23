import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tag } from '../../core/entities/tag.entity.js';
import { CacheService } from '../../core/cache/cache.service.js';
import { CreateTagModels } from '../../core/models/create-tag.models.js';
import { UpdateTagModels } from '../../core/models/update-tag.models.js';
import { createSlug } from '../../core/utils/slug.util.js';
import { console } from 'inspector';

@Injectable()
export class TagService {
  @Inject(CacheService)
  private readonly cacheService!: CacheService;

  @InjectRepository(Tag)
  private readonly tagRepository!: Repository<Tag>;


  async getTags():Promise<Tag[]>{

    const cacheKey = 'tags:all'

    const cachedTags = await this.cacheService.get(cacheKey)

    if(cachedTags !== null){
        return JSON.parse(cachedTags) as Tag[];
    }


    const tags = await this.tagRepository.find({
        order : {
            name : 'ASC'
        },
    });

    await this.cacheService.set(
        cacheKey,
        JSON.stringify(tags),
        60,
    );

    return tags
  }

  async getTag(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
        where: { id },
    });

    if (!tag) {
        throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async createTag(
    createTagModels : CreateTagModels,
  ):Promise<Tag>{
    const name = createTagModels.name.trim();

    const existingTag = await this.tagRepository.findOne({
        where : {name}
    });

    if (existingTag) {
        throw new ConflictException('Tag name already exists');
    }

    const slug = createSlug(name);

    const existingSlug = await this.tagRepository.findOne({
        where : {slug},
    })

    if (existingSlug) {
        throw new ConflictException('Tag slug already exists');
    }

    const tag = this.tagRepository.create({
        name,
        slug,
    });

    const savedTag = await this.tagRepository.save(tag);

    await this.cacheService.del('tags:all');

    return savedTag;
  }

  async updateTag(
    id : number,
    updateTagModels: UpdateTagModels,
  ):Promise<Tag>{
    const tag = await this.getTag(id)

    if(updateTagModels.name !== undefined){
        const name = updateTagModels.name.trim();

        const existingTag = await this.tagRepository.findOne({
            where : {name}
        });

        if(existingTag && existingTag.id !== id){
            throw new ConflictException('Tag name already exists');
        }

        const slug = createSlug(name);

        const existingSlug = await this.tagRepository.findOne({
            where : {slug}
        });

        if (existingSlug && existingSlug.id !== id) {
            throw new ConflictException('Tag slug already exists');
        }

        tag.name = name;
        tag.slug = slug;
    }

    const updatedTag = await this.tagRepository.save(tag);

    await this.cacheService.del('tags:all');

    return updatedTag;
  }

 
    async deleteTag(id: number): Promise<void> {
        const tag = await this.getTag(id);

        await this.tagRepository.remove(tag);

        await this.cacheService.del('tags:all');
    }



}