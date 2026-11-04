import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../core/entities/user.entity.js';
import { Post } from '../../core/entities/post.entity.js';
import { View } from '../../core/entities/view.entity.js';

import { CacheService } from '../../core/cache/cache.service.js';
import { PostStatus } from '../../core/enum/post-status.enum.js';

@Injectable()
export class AdminService{

    @InjectRepository(User)
    private readonly userRepository!: Repository<User>;

    @InjectRepository(Post)
    private readonly postRepository!: Repository<Post>;

    @InjectRepository(View)
    private readonly viewRepository!: Repository<View>;

    @Inject(CacheService)
    private readonly cacheService!: CacheService;

    private readonly cacheKey = 'admin:dashboard:overview';
    private readonly cacheTtl = 60;

    async getOverview(){
        const cached = await this.cacheService.get(this.cacheKey);

        if(cached){
            return JSON.parse(cached);
        }

        const [totalUsers,totalPosts,publishedPosts,draftPosts,totalViews] = await Promise.all([
           
            this.userRepository.count(),

            this.postRepository.count(),

            this.postRepository.count({
                where: { status: PostStatus.PUBLISHED },
            }),

            this.postRepository.count({
                where: { status: PostStatus.DRAFT },
            }),

            this.viewRepository.count(),
            ]);

            const overview = {
                totalUsers,totalPosts,publishedPosts,draftPosts,totalViews
            };

            await this.cacheService.set(
                this.cacheKey,
                JSON.stringify(overview),
                this.cacheTtl,
            );

            return overview;
        }


    
}