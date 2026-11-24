import { Inject, Logger, Injectable, BadRequestException, NotFoundException, ConflictException, InternalServerErrorException,ForbiddenException } from '@nestjs/common';
import { StorageService } from '../../core/storage/storage.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from '../../core/entities/media.entity.js';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
import { User } from '../../core/entities/user.entity.js';
import { Post } from '../../core/entities/post.entity.js';
import { Block } from '../../core/entities/block.entity.js';


@Injectable()
export class MediaService {

    @Inject(StorageService)
    private readonly storageService! : StorageService;

    @InjectRepository(Media)
    private readonly mediaRepository! : Repository<Media>;

    @InjectRepository(User)
    private readonly userRepository!: Repository<User>;

    @InjectRepository(Post)
    private readonly postRepository!: Repository<Post>;

    @InjectRepository(Block)
    private readonly blockRepository!: Repository<Block>;

    private readonly maxFileSize = 5 * 1024 * 1024;

    private readonly allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
    ];

    private readonly logger = new Logger(MediaService.name);
    
    private validateImageMedia(media: Media): void {
    const allowedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    if (!allowedImageTypes.includes(media.mimeType)) {
        throw new BadRequestException(
        'Only image files can be used in this location.',
        );
    }
}
    
    private async validateFile(file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
    }): Promise<void> {
    if (!file.buffer || file.buffer.length === 0) {
        throw new BadRequestException('File cannot be empty');
    }

    if (!file.originalname.trim()) {
        throw new BadRequestException('Original filename is required');
    }

    if (!file.mimetype.trim()) {
        throw new BadRequestException('File MIME type is required');
    }

    if (file.size !== file.buffer.length) {
        throw new BadRequestException(
        'File size does not match buffer size',
        );
    }

    if (file.size > this.maxFileSize) {
        throw new BadRequestException(
        'File size must not exceed 5 MB',
        );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('File type is not allowed');
    }

    const detectedType = await fileTypeFromBuffer(file.buffer);

    if (
        !detectedType ||
        !this.allowedMimeTypes.includes(detectedType.mime) ||
        detectedType.mime !== file.mimetype
    ) {
        throw new BadRequestException(
        'File content does not match the allowed file type',
        );
    }




    }

    
    
    async upload(
        file :{
            buffer : Buffer;
            originalname: string;
            mimetype: string;
            size: number;
        },
        userId : number,
        
    ):Promise<Media>{
       await this.validateFile(file);

        const filename = randomUUID();
        const key = `media/${filename}`;

        await this.storageService.upload(
            key,
            file.buffer,
            file.mimetype
        );


        try {
            const media = this.mediaRepository.create({
                filename,
                originalName : file.originalname,
                mimeType : file.mimetype,
                size : file.size,
                path : key,
                owner : { id: userId } ,
            });

            return await this.mediaRepository.save(media);
        }  catch (error) {
            try {
                await this.storageService.delete(key);
            } catch (cleanupError) {
                this.logger.error(
                    `Failed to cleanup uploaded file: ${key}`,
                    cleanupError instanceof Error
                        ? cleanupError.stack
                        : String(cleanupError),
                );
            }

            throw error;
        }
    }


    async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOne({
        where: { id },
        relations: {
        owner: true,
        },
    });

    if (!media) {
        throw new NotFoundException('Media not found');
    }

        return media;
    }

    async attachToPost(
        userId: number,
        postId: number,
        mediaId: number,
    ): Promise<void> {
        const [post, media] = await Promise.all([
            this.postRepository.findOne({
            where: { id: postId },
            }),
            this.findOne(mediaId),
        ]);

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        this.validateImageMedia(media);

        if (media.owner.id !== userId) {
            throw new ForbiddenException(
            'You can only use your own media.',
            );
        }
        const [isAvatar, isBlockMedia] = await Promise.all([
            this.userRepository
                .createQueryBuilder('user')
                .innerJoin('user.avatarMedia', 'avatarMedia')
                .where('avatarMedia.id = :mediaId', { mediaId })
                .getExists(),

            this.blockRepository
                .createQueryBuilder('block')
                .innerJoin('block.media', 'media')
                .where('media.id = :mediaId', { mediaId })
                .getExists(),
            ]);

            if (isAvatar || isBlockMedia) {
            throw new ConflictException(
                'Media is already used in another location.',
            );
        }


        post.coverMedia = media;

        await this.postRepository.save(post);
    }

    async attachToBlock(
        userId: number,
        blockId: number,
        mediaId: number,
    ): Promise<void> {
        const [block, media] = await Promise.all([
            this.blockRepository.findOne({
            where: { id: blockId },
    
            }),
            this.findOne(mediaId),
        ]);

        if (!block) {
            throw new NotFoundException('Block not found');
        }

        this.validateImageMedia(media);


        if (media.owner.id !== userId) {
            throw new ForbiddenException(
            'You can only use your own media.',
            );
        }
        const [isAvatar, isPostCover] = await Promise.all([
            this.userRepository
                .createQueryBuilder('user')
                .innerJoin('user.avatarMedia', 'avatarMedia')
                .where('avatarMedia.id = :mediaId', { mediaId })
                .getExists(),

            this.postRepository
                .createQueryBuilder('post')
                .innerJoin('post.coverMedia', 'coverMedia')
                .where('coverMedia.id = :mediaId', { mediaId })
                .getExists(),
            ]);

            if (isAvatar || isPostCover) {
            throw new ConflictException(
                'Media is already used in another location.',
            );
        }
        block.media = media;

        await this.blockRepository.save(block);
    }
    
    

    async updateAvatar(userId : number, mediaId : number):Promise<void>{
        const media = await this.findOne(mediaId);

        this.validateImageMedia(media);


        if(media.owner.id !== userId){
            throw new ForbiddenException('You can only use your own media.')
        }

        const [isPostCover, isBlockMedia] = await Promise.all([
            this.postRepository
                .createQueryBuilder('post')
                .innerJoin('post.coverMedia', 'coverMedia')
                .where('coverMedia.id = :mediaId', { mediaId })
                .getExists(),

            this.blockRepository
                .createQueryBuilder('block')
                .innerJoin('block.media', 'media')
                .where('media.id = :mediaId', { mediaId })
                .getExists(),
            ]);

            if (isPostCover || isBlockMedia) {
            throw new ConflictException(
                'Media is already used in another location.'            );
            }


        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.avatarMedia = media;

        await this.userRepository.save(user);
        
    }

    async getReadAccess(id:number):Promise<string>{
        const media = await this.findOne(id);
        const[isAvatar, isPublishedCover, isPublishedBlockImage] = await Promise.all([
            this.userRepository
                .createQueryBuilder('user')
                .innerJoin('user.avatarMedia','avatarMedia')
                .where('avatarMedia.id = :id', { id })
                .getExists(),

            this.postRepository
                .createQueryBuilder('post')
                .innerJoin('post.coverMedia', 'coverMedia')
                .where('coverMedia.id = :id', { id })
                .andWhere('post.status = :status', {status: 'published'})

                .getExists(),

            this.blockRepository
                .createQueryBuilder('block')
                .innerJoin('block.media', 'media')
                .innerJoin('block.post', 'post')
                .where('media.id = :id', { id })
                .andWhere('post.status = :status', {status: 'published'})
                .getExists(),

        ]);

        if(!isAvatar && !isPublishedCover && !isPublishedBlockImage){
            throw new ForbiddenException('You are not allowed to access this media.');
        }
        const access = await this.storageService.getReadAccess(media.path,300);


        return access.url;
    }

    async remove(id: number): Promise<void> {
        const media = await this.findOne(id);

        const [isAvatar, isPostCover, isBlockMedia] = await Promise.all([
            this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.avatarMedia', 'avatarMedia')
            .where('avatarMedia.id = :id', { id })
            .getExists(),

            this.postRepository
            .createQueryBuilder('post')
            .innerJoin('post.coverMedia', 'coverMedia')
            .where('coverMedia.id = :id', { id })
            .getExists(),

            this.blockRepository
            .createQueryBuilder('block')
            .innerJoin('block.media', 'media')
            .where('media.id = :id', { id })
            .getExists(),
        ]);

        if (isAvatar || isPostCover || isBlockMedia) {
            throw new ConflictException(
            'Media is currently in use and cannot be deleted.',
            );
        }

        try {
            await this.storageService.delete(media.path);
        } catch {
            throw new InternalServerErrorException(
            'File could not be deleted from storage.',
            );
        }

        await this.mediaRepository.remove(media);
    }

}
