import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated
  } from 'typeorm';

  @Entity({ name: 'systeminfo' })
  export class SystemInfo extends BaseEntity {
    @PrimaryGeneratedColumn()
    ref_no: number;

    @Column()
    @Generated("uuid")
    id: string;
  
    @Column({type:"uuid", default:null})
    loan_id: string;  

    @Column({type:"uuid", default:null})
    user_id: string;  

    @Column()
    moduleManufacturer: string; 

    @Column()
    inverterManufacturer: string;

    @Column()
    batteryManufacturer: string;

    @Column()
    signature: string;

    @Column({type:"float"})
    systemSize: number;

    @Column({type:"float"})
    estAnnualProduction: number;

    @CreateDateColumn()
    createdat: Date;

    @UpdateDateColumn()
    updatedat: Date; 
    
  }
  