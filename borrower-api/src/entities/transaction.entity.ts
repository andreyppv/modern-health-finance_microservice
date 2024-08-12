import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity
    
  } from 'typeorm';

  export enum Flags {
    N = 'N',
    Y = 'Y'
  }

  export enum method {
    card = 'Card',
    bankaccount = 'Bank Account'
  }

  export enum payment {
    Loan = 'Loan',
    Milestone1 = 'Milestone1',
    Milestone2 = 'Milestone2',
    Milestone3 = 'Milestone3'
  }
  
@Entity({ name: 'transaction' })
export class TransactionEntity extends BaseEntity {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({default:null})
authcode: string;

@Column({default:null})
message: string;

@Column({default:null})
status: string;

@Column({default:null})
transactionid: string;

@Column({
    type:'enum',
    enum: method,
    default: method.card,
  })
accountmethod: method;

@Column({
    type:'enum',
    enum: payment,
    default: payment.Loan,
  })
  payment: payment;

@Column({type:"uuid",default:null})
account_id: string;

@Column({type:"uuid",default:null})
loan_id: string;

@Column({default:null})
amount: string;

@Column({
  type:'enum',
  enum: Flags,
  default: Flags.N,
})
delete_flag: Flags;

@CreateDateColumn()
createdat: Date;

@UpdateDateColumn()
updatedat: Date;

}

