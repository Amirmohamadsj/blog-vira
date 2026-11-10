import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


import type { User } from './user.entity.js';
import type { Post } from './post.entity.js';


@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  content!: string;

  @Index('IDX_comments_user_id')
  @ManyToOne('User', (user:User) => user.comments,{
    onDelete:'RESTRICT'
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index('IDX_comments_post_id')
  @ManyToOne('Post', (post:Post) => post.comments,{
    onDelete:'CASCADE'
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}