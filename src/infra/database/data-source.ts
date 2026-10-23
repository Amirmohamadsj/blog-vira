import 'dotenv/config';
import { DataSource } from "typeorm";
import { User } from "../../core/entities/user.entity.js";
import { Post } from "../../core/entities/post.entity.js";
import { Category } from "../../core/entities/category.entity.js";
import { Tag } from "../../core/entities/tag.entity.js";
import { Comment } from "../../core/entities/comment.entity.js";
import { Media } from "../../core/entities/media.entity.js";
import { View } from "../../core/entities/view.entity.js";
import { Block } from '../../core/entities/block.entity.js';


export const AppDataSource = new DataSource({


  type: 'postgres',
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT)!,
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,

  entities: [User,Post,Category,Tag,Comment,Media,View,Block],
  migrations: ['src/infra/database/migrations/*.ts'],

  synchronize: false,
})