import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated,
} from 'typeorm';

export enum StatusFlags {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export enum Flags {
  N = 'N',
  Y = 'Y',
}

@Entity({ name: 'paymentschedule' })
export class PaymentscheduleEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', default: null })
  loan_id: string;

  @Column({ type: 'float', default: null })
  unpaidprincipal: number;

  @Column({ type: 'float', default: null })
  principal: number;

  @Column({ type: 'float', default: null })
  interest: number;

  @Column({ type: 'float', default: null })
  fees: number;

  @Column({ type: 'float', default: null })
  amount: number;

  @Column({ type: 'date', default: null })
  scheduledate: string;

  @Column({
    type: 'enum',
    enum: StatusFlags,
    default: StatusFlags.UNPAID,
  })
  status_flag: StatusFlags;

  @Column({ type: 'date', default: null })
  paidat: string;

  @Column({ default: null })
  transactionid: string;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
  })
  delete_flag: Flags;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
