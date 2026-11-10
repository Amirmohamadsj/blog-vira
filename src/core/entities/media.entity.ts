import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn
} from 'typeorm';

import type { User } from './user.entity.js';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  filename!: string;

  @Column({ length: 255 })
  originalName!: string;

  @Column({ length: 100 })
  mimeType!: string;

  @Column()
  size!: number;

  @Column({ length: 500 })
  path!: string;
 

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt! : Date;
}
