import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated
    
  } from 'typeorm';

  export enum Flags {
    N = 'N',
    Y = 'Y'
  }

  @Entity({ name: 'userdebitcard' })
  export class UserDebitCard extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type:"uuid", default:null})
    user_id: string;

    @Column()
    fullname: string;

    @Column({type:"bigint"})
    cardnumber: number;

    @Column()
    expires: string;

    @Column()
    csc: number;

    @Column()
    billingaddress: string;

    @Column({default:null})
    loanpayment_paymentmethodtoken: string;

    @Column({
        type:'enum',
        enum: Flags,
        default: Flags.N,
    })
    active_flag: Flags;

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