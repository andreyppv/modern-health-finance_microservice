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

@Entity({ name: 'bankaccounts' })
export class BankAccounts extends BaseEntity {
  @Column()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  loan_id: string;

  @Column({ type: 'uuid', default: null })
  plaid_access_token_master_id: string;

  @Column({ default: null })
  headername: string;

  @Column({ default: null })
  name: string;

  @Column({ default: null })
  type: string;

  @Column({ default: null })
  subtype: string;

  @Column({ default: null })
  acno: string;

  @Column({ default: null })
  routing: string;

  @Column({ default: null })
  wire_routing: string;

  @Column({ default: null })
  institution_id: string;

  @Column({ type: 'float', default: null })
  available: number;

  @Column({ type: 'float', default: 0 })
  current: number;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
  })
  delete_flag: Flags;

  @Column({ default: false })
  lendedtype: boolean;

  @Column({ default: false })
  borrowertype: boolean;

  @Column({ default: null })
  bankname: string;

  @Column({ default: null })
  accountholder: string;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;

  @Column({ default: null })
  account_id: string;

  @Column({ default: null })
  ref_accountid: string;

  @Column({
    type:'enum',
    enum: Flags,
    default: Flags.Y,
  })
  is_migrated: Flags;


  //additional 
     //  no difference
  




  
}
