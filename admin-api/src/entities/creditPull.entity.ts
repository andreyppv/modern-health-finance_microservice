import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated,
} from 'typeorm';
@Entity({ name: 'creditpull' })
export class CreditPull extends BaseEntity {
  @Column()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  loan_id: string;

  @Column({ default: null })
  vendorid: string;

  @Column({ default: null })
  lastresponse: string;

  @Column({ default: null })
  file: string;

  @Column({ default: null })
  lastsendinformation: string;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
