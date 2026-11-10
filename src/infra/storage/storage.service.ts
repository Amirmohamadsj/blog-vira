import {
  Injectable,
  Inject,
  OnModuleInit,
} from '@nestjs/common';

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import {
  StorageService as StorageServiceContract,
} from '../../core/storage/storage.service.js';

import { StorageFile } from '../../core/storage/storage-file.model.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioStorageService
  extends StorageServiceContract
  implements OnModuleInit {
  @Inject(ConfigService)
  private readonly configService!: ConfigService;

  private s3!: S3Client;
  private bucket!: string;

  onModuleInit(): void {
    const useSsl =
      this.configService.getOrThrow<string>('MINIO_USE_SSL') === 'true';

    const endpoint = `http${useSsl ? 's' : ''}://${this.configService.getOrThrow<string>('MINIO_ENDPOINT')}:${this.configService.getOrThrow<string>('MINIO_PORT')}`;

    this.bucket =
      this.configService.getOrThrow<string>('MINIO_BUCKET');

    this.s3 = new S3Client({
      endpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId:
          this.configService.getOrThrow<string>('MINIO_ROOT_USER'),
        secretAccessKey:
          this.configService.getOrThrow<string>('MINIO_ROOT_PASSWORD'),
      },
      forcePathStyle: true,
    });
  }

  async testConnection(): Promise<void> {
    await this.s3.send(
        new HeadBucketCommand({
        Bucket: this.bucket,
        }),
    );
  }


  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async get(key: string):Promise<StorageFile> {
    const response = await this.s3.send(
      new GetObjectCommand({
        Bucket : this.bucket,
        Key : key
      })
    )
    

    if (!response.Body) {
      throw new Error('File body is empty');
    }

    const body = await response.Body.transformToByteArray();

    return {
      body : Buffer.from(body),
      contentType : response.ContentType,
    }
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}