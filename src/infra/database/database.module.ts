import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres' as const,
                host: configService.getOrThrow<string>('DB_HOST'),
                port: Number(configService.getOrThrow<string>('DB_PORT')),
                username: configService.getOrThrow<string>('DB_USERNAME'),
                password: configService.getOrThrow<string>('DB_PASSWORD'),
                database: configService.getOrThrow<string>('DB_NAME'),
                autoLoadEntities: false,
                synchronize: false,
            }),
        }),
    ],
})
export class DatabaseModule {}