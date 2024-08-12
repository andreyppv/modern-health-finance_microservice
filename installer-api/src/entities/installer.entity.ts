import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated
  } from 'typeorm';

  @Entity({ name: 'installer' })
  export class Installer extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type:"uuid", default:null})
    user_id: string;
  
    @Column()
    firstname: string;
  
    @Column()
    lastname: string;
  
    // @Column()
    // birthday: string;

    @Column()
    email: string;
  
    @Column()
    phone: string;
  
    @Column()
    streetaddress: string;
  
    @Column({default:null})
    unit: string;
  
    @Column()
    city: string;
  
    @Column()
    state: string;
  
    @Column()
    zipcode: number;

    @Column({default:1})
    offermodel: number;

    @Column({default:null})
    loanpayment_customertoken: string;

    @Column({default:null})
    loanpayment_ach_customertoken: string;

    @CreateDateColumn()
    createdat: Date;

    @UpdateDateColumn()
    updatedat: Date;
    
  }
  