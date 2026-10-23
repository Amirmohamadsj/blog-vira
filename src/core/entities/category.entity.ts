import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';


import type { Post } from './post.entity.js';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    length: 100,
  })
  name!: string;

  @Column({
    unique: true,
    length: 100,
  })
  slug!: string;

  @OneToMany('Post', (post:Post) => post.category)
  posts!: Post[];

  @CreateDateColumn()
  createdAt!: Date;
  
  @UpdateDateColumn()
  updatedAt! : Date;
}