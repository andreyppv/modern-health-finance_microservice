import { text } from 'aws-sdk/clients/customerprofiles';
import { IsNotEmpty } from 'class-validator';
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

@Entity({ name: 'practice' })
export class PracticeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  ref_no: number;

  @Column()
  @Generated('uuid')
  id: string;

  @Column({ default: null })
  contactname: string;

  @Column()
  email: string;

  @Column({ default: null })
  practicename: string;

  @Column({ default: null })
  practiceurl: string;

  @Column({ default: null })
  practicehomeurl: string;

  @Column({ default: null })
  practicelinktoform: string;

  @Column({ default: null })
  locationname: string;

  @Column({ default: null })
  streetaddress: string;

  @Column()
  city: string;

  @Column({ default: null })
  statecode: string;

  @Column({ default: null })
  zipcode: string;

  @Column({ default: null })
  phonenumber: string;

  @Column({ default: null })
  @IsNotEmpty()
  practicesettings: number;

  @Column({ default: null })
  practicemaincolor: string;

  @Column({ default: null })
  practicesecondarycolor: string;

  @Column({ default: null })
  practicelogo: text;

  @Column({ default: null })
  practicepoweredbylogo: text;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;

  @Column({ default: null })
  practicemanagement_id: text;
  
  
}
