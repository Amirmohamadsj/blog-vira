import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module.js';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggerService } from './infra/logger/logger.service.js';
import { LoggerInterceptor } from './infra/logger/logger.interceptor.js';
import { LoggerExceptionFilter } from './infra/logger/logger-exception.filter.js';


async function bootstrap() {
  
  const app = await NestFactory.create(MainModule,{bufferLogs:true});

  app.useLogger(app.get(LoggerService));
  app.useGlobalInterceptors(app.get(LoggerInterceptor));
  app.useGlobalFilters(app.get(LoggerExceptionFilter));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist : true,
      forbidNonWhitelisted:true,
      transform:true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('API documentation for the blog management system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document,{
    jsonDocumentUrl:'api/docs-json'
  });

  await app.listen(process.env.PORT ?? 3000);

}
await bootstrap();