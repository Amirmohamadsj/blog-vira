import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Post } from './post.entity.js';
import { BlockType } from '../enum/block-type.enum.js';
import type { Media } from './media.entity.js';

@Entity('blocks')
@Index('IDX_blocks_post_id', ['postId'])
@Index('UQ_blocks_post_position', ['postId', 'position'], {
  unique: true,
})
export class Block {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'post_id' })
  postId!: number;

  @ManyToOne('Post', (post: Post) => post.blocks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ name: 'media_id', nullable: true })
  mediaId!: number | null;

  @ManyToOne('Media', {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'media_id' })
  media!: Media | null;
  
  @Column('text')
  content!: string;

  @Column({
    type: 'enum',
    enum: BlockType,
    default: BlockType.TEXT,
  })
  type!: BlockType;
  @Column({ type: 'integer' })
  position!: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastEdit!: Date | null;


  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}