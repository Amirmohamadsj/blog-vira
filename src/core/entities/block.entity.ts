import {
  Check,
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
import type { Media } from './media.entity.js';
import { BlockType } from '../enums/block-type.enum.js';

@Entity('blocks')
@Index('UQ_blocks_post_position', ['postId', 'position'], {
  unique: true,
})
@Check('"position" >= 0')
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

  @Column({
    type: 'enum',
    enum: BlockType,
    default: BlockType.TEXT,
  })
  type!: BlockType;

  @Column('text')
  content!: string;

  @Column({ type: 'integer' })
  position!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}