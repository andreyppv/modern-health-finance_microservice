import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

export enum Flags {
  N = 'N',
  Y = 'Y',
}

export enum UsersRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  INSTALLER = 'installer',
}

@Entity({ name: 'fuser' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  ref_no: number;

  @Column()
  @Generated('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  firstname: string;

  @Column({ default: null })
  middlename: string;

  @Column()
  lastname: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Exclude()
  @Column({ nullable: true })
  salt: string;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
  })
  delete_flag: Flags;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
  })
  emailverify: Flags;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
  })
  active_flag: Flags;

  @Column({ default: 0 })
  role: number;

  @Column({
    type: 'enum',
    enum: Flags,
    default: Flags.N,
  })
  twofactorauth: Flags;

  @Column({type: "uuid", default: null})
  maininstallerid: string;
  
  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;

  @Column({default:null})
  location:string

  @Column({default:null})
  mobile:string

  async validatePassword(password: string): Promise<boolean> {
    const hashPassword = await bcrypt.compare(password, this.password);
    return hashPassword;
  }
}