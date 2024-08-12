import { networkInterfaces } from 'os';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated,
} from 'typeorm';

export enum EmployerLanguage {
  ENGLISH = 'english',
  SPANISH = 'spanish',
}

export enum Flags {
  N = 'N',
  Y = 'Y',
}
export enum paymentfrequency_flag {
  M = 'M',
  B = 'B',
  S = 'S',
  W = 'W',
}

@Entity({ name: 'customer' })
export class CustomerEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  ref_no: number;

  @Column()
  @Generated('uuid')
  id: string;

  @Column({ default: null })
  email: string;

  @Column({ default: null })
  firstname: string;

  @Column({ default: null })
  middlename: string;

  @Column({ default: null })
  lastname: string;

  @Column({ default: null })
  socialsecuritynumber: string;

  @Column({ default: null })
  birthday: Date;

  @Column({ type: 'uuid', default: null })
  practiceid: string;

  @Column({ default: null })
  monthlyincome: number;

  @Column({ default: null })
  streetaddress: string;

  @Column({ default: null })
  unit: string;

  @Column({ default: null })
  city: string;

  @Column({ default: null })
  state: string;

  @Column({ default: null })
  zipcode: string;

  @Column({ default: null })
  phone: string;

  @Column({ default: null })
  typeofresidence: string;

  @Column({ default: null })
  housingexpense: number;

  @Column({ type: 'float', default: 0 })
  annualincome: number;

  @Column({ type: 'float', default: 0 })
  additionalincome: number;

  @Column({ type: 'float', default: 0 })
  mortgagepayment: number;

  @Column({ type: 'float', default: 0 })
  loanamount: number;

  @Column({ default: false })
  iscoapplicant: boolean;

  @Column({ type: 'uuid', default: null })
  coapplican_id: string;

  @Column({ type: 'uuid', unique: true, default: null })
  loan_id: string;

  @Column({ type: 'uuid', default: null })
  user_id: string;

  @Column({ default: null })
  incomesource: boolean;

  @Column({ default: null })
  workstatus: string;

  @Column({ type: 'float', default: null })
  income: number;

  @Column({ default: null })
  employer: string;

  @Column({ default: null })
  employerphone: string;

  @Column({ default: null })
  dateofhired: string;

  @Column({ default: null })
  jobtitle: string;

  @Column({ default: null })
  yearsemployed: number;

  @Column({ default: null })
  monthsemployed: number;

  @Column({ default: null })
  homeoccupancy: string;

  @Column({ default: null })
  homeownership: string;

  @Column({ default: null })
  signature: string;

  @Column({ default: null })
  loanterm: number;
  @Column({ default: null, type: 'float' })
  newapr: number;

  @Column({ default: null, type: 'float' })
  orginationfees: number;

  @Column({ default: null })
  sourceofincome: string;

  @Column({ default: 0 })
  netmonthlyincome: number;

  @Column({ default: null })
  payfrequency: string;

  @Column({ default: null })
  paymentdate: string;

  @Column({ default: 0 })
  dayofmonth: number;

  @Column({ default: null })
  paidformat: string;

  @Column({ default: null })
  password: string;

  @Column({ default: null })
  loanpayment_customertoken: string;

  @Column({ default: null })
  loanpayment_ach_customertoken: string;

  @Column({ type: 'float', default: null })
  apr: number;

  @Column({ type: 'float', default: 0 })
  monthlypayment: number;

  @Column({ default: null })
  plaid_access_token: string;
  @Column({
    type: 'enum',
    enum: EmployerLanguage,
    default: EmployerLanguage.ENGLISH,
  })
  spokenlanguage: EmployerLanguage;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
  })
  autopayment: Flags;

  @Column({ default: null })
  procedure_startdate: Date;

  @Column({ default: null })
  payment_duedate: string;

  @Column({ type: 'float', default: 0 })
  downpayment: number;

  @Column({ type: 'float', default: 0 })
  fundedrate: number;

  @Column({ type: 'float', default: 0 })
  salesprice: number;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
