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
  
@Entity({ name: 'creditreport' })
export class Creditreport extends BaseEntity {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({type:"uuid",default:null})
loan_id: string;

@Column()
report: string;

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

