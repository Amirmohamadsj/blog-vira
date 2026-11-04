import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Inject
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CacheService } from '../../core/cache/cache.service.js';
import { QueryPostsModels } from '../../core/models/post-models/query-posts.models.js';
import { applyQueryOptions } from '../../core/utils/builder.util.js';
import { Post } from '../../core/entities/post.entity.js';
import { Category } from '../../core/entities/category.entity.js';
import { Tag } from '../../core/entities/tag.entity.js';
import { Media } from '../../core/entities/media.entity.js';
import { User } from '../../core/entities/user.entity.js';
import { PostStatus } from '../../core/enum/post-status.enum.js';
import { CreatePostModels } from '../../core/models/post-models/create-post.models.js';
import { UpdatePostModels } from '../../core/models/post-models/update-post.models.js';
import { AuthTokenPayload } from '../../core/types/auth-token-payload.type.js';
import { createSlug } from '../../core/utils/slug.util.js';


@Injectable()
export class PostsService {
  @Inject(CacheService)
  private readonly cacheService!: CacheService;
  
  @InjectRepository(Post)
  private readonly postRepository!: Repository<Post>;

  @InjectRepository(Category)
  private readonly categoryRepository!: Repository<Category>;

  @InjectRepository(Tag)
  private readonly tagRepository!: Repository<Tag>;

  @InjectRepository(Media)
  private readonly mediaRepository!: Repository<Media>;

  @InjectRepository(User)
  private readonly userRepository!: Repository<User>;

  private assertPostAccess(
    post: Post,
    user: AuthTokenPayload,
    ): void {
    if (
        user.role !== 'admin' &&
        post.author.id !== user.sub
    ) {
        throw new ForbiddenException(
        'You cannot modify this post',
        );
    }
    }
  private async createUniqueSlug(title : string): Promise<string>{
        const baseSlug = createSlug(title);

        let slug = baseSlug;
        let counter = 2 ; 

        while(await this.postRepository.exists({where:{slug}})){
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        return slug;
    }

    async getPosts(query:QueryPostsModels):Promise<Post[]>{
        const cacheKey = `posts:all:${JSON.stringify({
            search: query.search,
            categoryId: query.categoryId,
            authorId: query.authorId,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        })}`;

        const cachedPosts = await this.cacheService.get(cacheKey)

        if(cachedPosts !== null){
            return JSON.parse(cachedPosts) as Post[];
        }

        const queryBuilder = this.postRepository
             .createQueryBuilder('post')
            .leftJoinAndSelect('post.author', 'author')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('post.tags', 'tags')
            .leftJoinAndSelect('post.coverMedia', 'coverMedia')
            .where('post.status = :status', { status: 'published' });

        applyQueryOptions(
            queryBuilder,{
                search:query.search,
                filters:{
                    categoryId : query.categoryId,
                    authorId: query.authorId,
                },
                sortBy:query.sortBy,
                sortOrder:query.sortOrder,

            },
            {
                searchColumns: ['post.title', 'post.content'],
                allowedFilters: {
                    categoryId: 'category.id',
                    authorId: 'author.id',
                },
                allowedSorts: {
                    createdAt: 'post.createdAt',
                    updatedAt: 'post.updatedAt',
                    title: 'post.title',
                },
            }
        )


        const posts = await queryBuilder.getMany()
            
        await this.cacheService.set(
            cacheKey,
            JSON.stringify(posts),
            60,
        );
        return posts
    }

    async getPost(id:number):Promise<Post>{
        const cacheKey = `posts:${id}`;

        const cachedPost = await this.cacheService.get(cacheKey);

        if(cachedPost !== null){
            return JSON.parse(cachedPost) as Post
        }

        const post = await this.postRepository.findOne({
            where: { id },
                relations: {
                author: true,
                category: true,
                tags: true,
                coverMedia: true,
            },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }
        await this.cacheService.set(
            cacheKey,
            JSON.stringify(post),
            60,
        );
        return post;
    }


    async createPost(
        createPostModels : CreatePostModels,
        authorId : number
    ):Promise<Post>{
        const author = await this.userRepository.findOne({
            where : {id : authorId},
        });

        if(!author){
            throw new NotFoundException('Author not found');
        }

        const category = await this.categoryRepository.findOne({
            where : {id : createPostModels.categoryId},
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }
        const tagIds = [...new Set(createPostModels.tagIds ?? [])];

        const tags = await this.tagRepository.findBy({
            id : In(tagIds),

        });

        if(tags.length !== tagIds.length){
            throw new NotFoundException('One or more tags not found');
        }

        let coverMedia : Media | null = null;

        if(createPostModels.coverMediaId !== undefined){
            const media = await this.mediaRepository.findOne({
                    where:{id:createPostModels.coverMediaId},
            });

            if (!media) {
                throw new NotFoundException('Cover media not found');
            }

            coverMedia = media;
        }

        const slug = await this.createUniqueSlug(createPostModels.title);

        const newPost = this.postRepository.create({
            title : createPostModels.title,
            slug,
            content:createPostModels.content,
            excerpt: createPostModels.excerpt,
            status: createPostModels.status ?? PostStatus.DRAFT,
            author,
            category,
            tags,
            coverMedia,
        });

    try {
      const savedPost = await this.postRepository.save(newPost);

      await this.cacheService.del('posts:all')
      return savedPost;
    } catch (error) {
    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('Post slug already exists');
      }

      throw error;
        
    }
  }

  async updatePost(
    id:number,
    updatePostModels :  UpdatePostModels,
    user : AuthTokenPayload,
  ):Promise<Post>{
    const post = await this.postRepository.findOne({
        where: { id },
            relations: {
            author:true,
            tags: true,
            coverMedia: true,
        },
    });

    if (!post) {
        throw new NotFoundException('Post not found');
    }

    this.assertPostAccess(post, user);


    if(updatePostModels.title !== undefined){
        post.title = updatePostModels.title;
        post.slug = await this.createUniqueSlug(updatePostModels.title);
    }
    if(updatePostModels.content !== undefined){
        post.content = updatePostModels.content;
    }

    if (updatePostModels.excerpt !== undefined) {
        post.excerpt = updatePostModels.excerpt;
    }

    if (updatePostModels.status !== undefined) {
        post.status = updatePostModels.status;
    }

    if(updatePostModels.categoryId !== undefined){
        const category = await this.categoryRepository.findOne({
            where : {id: updatePostModels.categoryId}
        });

        if(!category){
            throw new NotFoundException('Category not found');
        }

        post.category = category;
    }

    if(updatePostModels.tagIds !== undefined){
        const tagIds = [...new Set(updatePostModels.tagIds)];

        const tags = await this.tagRepository.findBy({
            id : In(tagIds),
        });

        if(tags.length !== tagIds.length){
            throw new NotFoundException('One or more tags not found');
        }

        post.tags = tags;
    }

    if(updatePostModels.coverMediaId !== undefined){
        const media = await this.mediaRepository.findOne({
            where:{id : updatePostModels.coverMediaId},
        });

        if (!media) {
            throw new NotFoundException('Cover media not found');
        }

        post.coverMedia = media;
    }

    const updatedPost = await this.postRepository.save(post);

    await this.cacheService.del('posts:all');
    await this.cacheService.del(`posts:${id}`);


    return updatedPost;
  }

  async deletePost(id: number,user : AuthTokenPayload): Promise<void> {
    const post = await this.postRepository.findOne({
        where: { id },
    });

    if (!post) {
        throw new NotFoundException('Post not found');
    }

    this.assertPostAccess(post, user);

    await this.postRepository.remove(post);


    await this.cacheService.del('posts:all');
    await this.cacheService.del(`posts:${id}`);

  }

  
    async getAllPostsForAdmin(): Promise<Post[]> {
        return this.postRepository.find({
            relations: {
            author: true,
            category: true,
            tags: true,
            coverMedia: true,
            },
            order: {
            createdAt: 'DESC',
            },
        });
    }

    async getPostForAdmin(id: number) {
        const post = await this.postRepository.findOne({
            where: { id },
            relations: {
            author: true,
            category: true,
            coverMedia: true,
            tags: true,
            },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return post;
    }
    

}