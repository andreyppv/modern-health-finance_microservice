import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

export enum LogTypeFlags {
  default = 'default',
  login = 'login',
}

@Entity({ name: 'log' })
export class LogEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  module: string;

  @Column({
    type: 'enum',
    enum: LogTypeFlags,
    default: LogTypeFlags.default,
  })
  type: LogTypeFlags;

  @Column({ type: 'uuid', default: null })
  loan_id: string;

  @Column({ default: null })
  error: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
