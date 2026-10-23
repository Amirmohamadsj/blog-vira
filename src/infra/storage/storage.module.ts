import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioStorageService } from './storage.service.js';
import { StorageService } from '../../core/storage/storage.service.js';

@Module({
  imports: [ConfigModule],
  providers: [{
    provide : StorageService,
    useClass : MinioStorageService,
  }],
  exports: [StorageService],
})
export class StorageModule {}