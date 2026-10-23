import { Injectable,NotFoundException,ConflictException,Inject } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../../core/entities/category.entity.js';
import { CreateCategoryModels } from '../../core/models/create-category.models.js';
import { UpdateCategoryModels } from '../../core/models/update-category.models.js';
import { CacheService } from '../../core/cache/cache.service.js';
import { createSlug } from '../../core/utils/slug.util.js';


@Injectable()
export class CategoriesService {

    @Inject(CacheService)
    private readonly cacheService! : CacheService;

    @InjectRepository(Category)
    private readonly categoryRepository! : Repository<Category>;


    async getCategories():Promise<Category[]>{
        const cacheKey = 'categories:all';
        const cachedCategories = await this.cacheService.get(cacheKey);

        if(cachedCategories !== null){
            return JSON.parse(cachedCategories) as Category[];
        }

        const categories = await this.categoryRepository.find({
            order : {
                name : 'ASC',
            },
        })
        await this.cacheService.set(
            cacheKey,
            JSON.stringify(categories),
            60,
        );

        return categories;
    }

    async getCategory(id:number):Promise<Category>{
        const category = await this.categoryRepository.findOne({
            where : {id}
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async createCategory(
            createCategoryModels:CreateCategoryModels,
        ):Promise<Category>{
            const name = createCategoryModels.name.trim();

            const existingCategory = await this.categoryRepository.findOne({
                where : {name},
            });

            if (existingCategory) {
                throw new ConflictException('Category name already exists');
            }

            const slug = createSlug(name)

            const existingSlug = await this.categoryRepository.findOne({
                where: { slug },
            });

            if (existingSlug) {
                throw new ConflictException('Category slug already exists');
            }

            const category = this.categoryRepository.create({
                name,
                slug,
            });

            const savedCategory = await this.categoryRepository.save(category);

            await this.cacheService.del('categories:all');

            return savedCategory;

        }

        async updateCategory(id:number,updateCategoryModels:UpdateCategoryModels):Promise<Category>{

            const category = await this.getCategory(id);

            if(updateCategoryModels.name !== undefined){
                const name = updateCategoryModels.name.trim();

                const existingCategory = await this.categoryRepository.findOne({
                    where : {name},
                });

                if(existingCategory && existingCategory.id !== id){
                    throw new ConflictException('Category name already exists');
                }

                const slug = createSlug(name)

                const existingSlug = await this.categoryRepository.findOne({
                    where : {slug}
                });

                if(existingSlug && existingSlug.id !== id){
                    throw new ConflictException('Category slug already exists');
                }

                category.name = name;
                category.slug = slug;
            }

            const updatedCategory = await this.categoryRepository.save(category);

            await this.cacheService.del('categories:all');

            return updatedCategory;
        }


        async deleteCategory(id: number): Promise<void> {
            const category = await this.getCategory(id);

            await this.categoryRepository.remove(category);

            await this.cacheService.del('categories:all');
    }
    
}
