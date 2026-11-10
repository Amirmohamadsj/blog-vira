import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { Post } from './post.entity.js';

@Entity('views')
export class View {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index('IDX_views_post_id')
  @ManyToOne(
    'Post',
    (post: Post) => post.views,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @CreateDateColumn()
  createdAt!: Date;
}