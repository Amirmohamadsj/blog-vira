import { Module } from '@nestjs/common';
import { ViewService } from './view.service.js';
import { ViewController } from './view.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { View } from '../../core/entities/view.entity.js';

@Module({
  imports:[TypeOrmModule.forFeature([View])],
  providers: [ViewService],
  controllers: [ViewController]
})
export class ViewModule {}
