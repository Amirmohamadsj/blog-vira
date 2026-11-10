import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


import { Post } from './post.entity.js';
@Entity('tags')
export class Tag {
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
  @ManyToMany(() => Post, (post) => post.tags)
  posts!: Post[];

  
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt! : Date;
}