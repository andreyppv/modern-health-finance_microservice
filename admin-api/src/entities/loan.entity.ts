import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated,
} from 'typeorm';

export enum Flags {
  N = 'N',
  Y = 'Y',
}

export enum StatusFlags {
  approved = 'approved',
  canceled = 'canceled',
  waiting = 'waiting',
  pending = 'pending',
  fundingcontract = 'fundingcontract',
  performingcontract = 'performingcontract',
  archive = 'archive',
  approvedcontract = 'approvedcontract',
}

@Entity({ name: 'loan' })
export class Loan extends BaseEntity {
  @PrimaryGeneratedColumn()
  ref_no: number;

  @Column()
  @Generated('uuid')
  id: string;

  @Column({ default: null })
  email: string;

  @Column({ type: 'uuid', default: null })
  user_id: string;

  @Column({ type: 'float', default: 0 })
  monthlypayment: number;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
  })
  delete_flag: Flags;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
  })
  active_flag: Flags;

  @Column({ type: 'uuid', default: null })
  ins_user_id: string;

  @Column({ default: null })
  signature: string;

  @Column({ default: null })
  datesignature: string;

  @Column({ default: null })
  signature_ip: string;

  @Column({ default: null })
  denied_reason: string;

  @Column({ default: null })
  date: Date;

  @Column({ default: 1 })
  step: number;

  @Column({ default: null })
  lastscreen: string;

  @Column({
    type: 'enum',
    enum: StatusFlags,
    default: StatusFlags.waiting,
  })
  status_flag: StatusFlags;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
