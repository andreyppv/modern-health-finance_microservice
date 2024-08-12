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
  
@Entity({ name: 'files' })
export class FilesEntity extends BaseEntity {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({type:"uuid"})
link_id: string;

@Column()
services: string;

@Column()
originalname: string;

@Column()
filename: string;

@Column({default:null})
documenttype: string;

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

