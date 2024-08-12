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
    Y = 'Y',
  }
  
  @Entity({ name: 'plaidaccesstokenmaster' })
  export class PlaidAccessTokenMaster extends BaseEntity {
    @Column()
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column({type:"uuid"})
    user_id: string;

    @Column({type:"uuid"})
    loan_id: string;
  
    @Column()
    plaid_access_token: string;

    @Column({default: null})
    institutionname: string;

    @Column({default: null})
    bankholdername: string;

    @Column({default: null})
    bankholderemail: string;

    @Column({default: null})
    bankholderphone: string;

    @Column({default: null})
    bankholderaddress: string;

    @Column({default: null})
    v1_email: string;

    @Column({default: null})
    v1_phone: string;

    @Column({default: null})
    v1_address: string;

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

    @Column({default: null})
    flinksattr: string;

    @Column({ default: null })
    asset_report_token:string

    @Column({ default: null })
    ref_bankaccountid:string

    @Column({
      type:'enum',
      enum: Flags,
      default: Flags.Y,
    })
    is_migrated: Flags;

    @Column({ default: null })
    v1_transactions:string
  }