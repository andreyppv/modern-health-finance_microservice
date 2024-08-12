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

@Entity({ name: 'banktransactions' })
export class BankTransactions extends BaseEntity {
  @Column()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', default:null })
  bankaccountid: string;

  @Column({ type: 'float' })
  amount: number;

  @Column()
  category: string;

  @Column()
  category_id: string;

  @Column()
  date: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
  
  @Column({ default: null })
  account_id: string;
}
