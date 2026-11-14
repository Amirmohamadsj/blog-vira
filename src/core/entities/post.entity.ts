import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToOne,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { User } from './user.entity.js';
import type { Category } from './category.entity.js';
import type { Media } from './media.entity.js';
import type { Comment } from './comment.entity.js';
import type { View } from './view.entity.js';
import type { Tag } from './tag.entity.js';
import type { Block } from './block.entity.js';
import { PostStatus } from '../enums/post-status.enum.js';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  title!: string;

  @Column({
    unique: true,
    length: 255,
  })
  slug!: string;

  @Column('text')
  content!: string;

  @Column('text')
  excerpt!: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status!: PostStatus;

  @Index('IDX_posts_author_id')
  @ManyToOne('User', (user: User) => user.posts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Index('IDX_posts_category_id')
  @ManyToOne(
    'Category',
    (category: Category) => category.posts,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @OneToOne('Media', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cover_media_id' })
  coverMedia!: Media | null;

  @OneToMany('Comment', (comment: Comment) => comment.post)
  comments!: Comment[];

  @OneToMany('View', (view: View) => view.post)
  views!: View[];

  @ManyToMany('Tag', (tag: Tag) => tag.posts)
  @JoinTable({
    name: 'post_tags',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags!: Tag[];

  @OneToMany('Block', (block: Block) => block.post)
  blocks!: Block[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}