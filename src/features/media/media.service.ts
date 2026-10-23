import { Inject, Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../../core/storage/storage.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from '../../core/entities/media.entity.js';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';



@Injectable()
export class MediaService {

    @Inject(StorageService)
    private readonly storageService! : StorageService;

    @InjectRepository(Media)
    private readonly mediaRepository! : Repository<Media>;

    private readonly maxFileSize = 5 * 1024 * 1024;

    private readonly allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
    ];


    
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
            });

            return await this.mediaRepository.save(media);
        } catch(error){
            try {
                await this.storageService.delete(key);
            } catch {

            }
            throw error
        }
    }


    async findOne(id: number): Promise<Media> {
        const media = await this.mediaRepository.findOne({
            where: { id },
        });

        if (!media) {
            throw new NotFoundException('Media not found');
        }

        return media;
    }

    
    async getFile(id: number): Promise<{
        body: Buffer;
        contentType?: string;
        originalName: string;
    }> {
        const media = await this.findOne(id);

        const file = await this.storageService.get(media.path);

        return {
            body: file.body,
            contentType: file.contentType ?? media.mimeType,
            originalName: media.originalName,
        };
    }

    async remove(id: number): Promise<void> {
        const media = await this.findOne(id);

        await this.mediaRepository.remove(media);

        try {
            await this.storageService.delete(media.path);
        } catch {
            throw new InternalServerErrorException(
                'Media record was deleted, but the file could not be deleted from storage',
            );
        }
    }

}
