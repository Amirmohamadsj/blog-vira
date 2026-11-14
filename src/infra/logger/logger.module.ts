import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service.js';
import { RequestContextService } from './context/request-context.service.js';
import { LoggerInterceptor } from './logger.interceptor.js';
import { LoggerExceptionFilter } from './logger-exception.filter.js';

@Module({
    providers: [LoggerService,RequestContextService,LoggerInterceptor,LoggerExceptionFilter],
    exports: [LoggerService,LoggerInterceptor,LoggerExceptionFilter],
})
export class LoggerModule {}