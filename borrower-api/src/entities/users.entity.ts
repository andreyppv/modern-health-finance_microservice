import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  BaseEntity,
  Generated,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { integer, timestamp } from 'aws-sdk/clients/cloudfront';
import { integerType } from 'aws-sdk/clients/iam';
import { Long } from 'aws-sdk/clients/opensearch';

export enum UsersRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  PRACTICEADMIN = 'practice admin',
}

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  ref_no : string;

  @Column()
  _id : string;
  
  @Column({ nullable: true })
  userreference: string;
  
  @Column({ nullable: true })
  practicemanagement: string;

  @Column({ default: null })
  firstname: string;

  @Column({ default: null })
  middlename: string;

  @Column({ default: null })
  lastname: string;

  @Column({ nullable: true })
  isphoneverified: string;

  @Column({ nullable: true })
  generationcode: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  street: string;
  
  @Column({ nullable: true })
  unitapt: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  _state: string;
  
  @Column({ nullable: true })
  zipcode: string;
  
  @Column({ nullable: true })
  ssn_number: string;

  @Column({ nullable: true })
  dateofbirth: string;

  @Column({ nullable: true })
  consentchecked: boolean;

  @Column({ default: 0 })
  role: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Exclude()
  @Column({ nullable: true })
  salt: string;

  @Column({ nullable: true })
  isdeleted: boolean;

  @Column({ nullable: true })
  isemailverified: boolean;

  @Column({ nullable: true })
  isvalidemail: boolean;

  @Column({ nullable: true })
  isvalidstate: boolean;

  @Column({ nullable: true })
  registeredtype: string;

  @Column({ nullable: true })
  isexistingloan: boolean;

  @Column({ nullable: true })
  isgovernmentissued: boolean;

  @Column({ nullable: true })
  ispayroll: boolean;

  
  @Column({ nullable: true })
  isbankadded: boolean;
  
  @Column('jsonb',{ nullable: true })
  oldemaildata: object;

  @Column({ nullable: true })
  underwriter: string;
  
  @Column({ nullable: true })
  consentforuers: boolean;
  
  @Column({ nullable: true })
  consentforaocr: boolean;

  @Column({ nullable: true })
  peconsentforntct: boolean;

  @Column({ nullable: true })
  privacypolicy: boolean;
  
  @Column({ nullable: true })
  prequalificationscd: boolean;

  @Column({ nullable: true })
  appversion: string;

  @Column({ nullable: true })
  clicktosave: integer;
  
  @Column({ nullable: true })
  clickfilloutmanually: integer;

  @Column({ nullable: true })
  clickplaidconnected: integer;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
  @Column({ nullable: true })
  isusercreatedstory: boolean;
  
  @Column({ nullable: true })
  isuserprofileupdated: boolean;

  @Column({ nullable: true})
  phonenumber: string;

  @Column({ nullable: true })
  __hevo__database_name: string;

  @Column({ nullable: true })
  __hevo_id: string;

  @Column({ nullable: true })
  passwordstatus: integer;

  // @Column('jsonb',{ nullable: true })
  @Column({ nullable: true })
  consentschecked: boolean;

  @Column({ nullable: true })
  unitapp: string;

  @Column({ nullable: true })
  emailreset: boolean;

  @Column({ nullable: true })
  systemuniquekey: string;

  @Column({ nullable: true })
  emailverificationcode: string;

  @Column({ nullable: true })
  __hevo__ingested_at: string;

  @Column({ nullable: true })
  __hevo__marked_deleted: boolean;

  @Column({ nullable: true })
  __hevo__source_modified_at: string;

  @Column({ nullable: true })
  phoneismobile: boolean;

  @Column({ nullable: true })
  mobileoptedin: boolean;

  //---------------------

    
  async validatePassword(password: string): Promise<boolean> {
    const hashPassword = await bcrypt.compare(password, this.password);
    return hashPassword;
  }
}
