import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

export enum Flags {
  N = 'N',
  Y = 'Y',
}

export enum offerTypeFlags {
  InitUserSelected = 'InitUserSelected',
  GeneratedByAPI = 'GeneratedByAPI',
  GeneratedByAdmin = 'GeneratedByAdmin',
}

@Entity({ name: 'loanoffers' })
export class LoanOffersEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  loan_id: string;

  @Column({ type: 'float', default: 0 })
  financialamount: number;

  @Column({ type: 'float', default: 0 })
  monthlyamount: number;

  @Column({ type: 'float', default: 0 })
  interestrate: number;

  @Column()
  duration: number;

  @Column({ type: 'float', default: 0 })
  originationfee: number;

  @Column({
    type: 'enum',
    enum: offerTypeFlags,
    default: offerTypeFlags.GeneratedByAPI,
  })
  offertype: offerTypeFlags;

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
  selected_flag: Flags;

  @Column({ type: 'float', default: 0 })
  downpayment: number;

  @Column({ type: 'float', default: 0 })
  fundedrate: number;

  @Column({ type: 'float', default: 0 })
  salesprice: number;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
