import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


import type { Post } from './post.entity.js';
import type { Media } from './media.entity.js';
import type { Comment } from './comment.entity.js';
import { UserRole } from '../enum/user-role.enum.js';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  username!: string;

  @Column({
    unique: true,
    length: 255,
  })
  email!: string;

  @Column({ length: 255, select:false })
  password!: string;

  @OneToMany('Post', (post:Post) => post.author)
  posts!: Post[];

  @OneToOne('Media', {
    nullable: true,
    onDelete:'SET NULL'
  })
  @JoinColumn({ name: 'avatar_media_id' })
  avatarMedia!: Media | null;

  @OneToMany('Comment', (comment:Comment) => comment.user)
  comments!: Comment[];

  @Column({
  type: 'enum',
  enum: UserRole,
  default: UserRole.USER,
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}