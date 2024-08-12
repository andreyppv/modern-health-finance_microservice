import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Flags {
  N = 'N',
  Y = 'Y',
}

@Entity({ name: 'practicerules' })
export class PracticeRulesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  ref_no: number;

  @Column({ unique: true })
  setting_name: string;

  @Column({ type: 'boolean', default: false })
  isdefault: boolean;

  @Column({ type: 'boolean', default: false })
  deny_tiers: boolean;

  @Column({ type: 'boolean', default: false })
  enable_transunion: boolean;

  @Column({ type: 'boolean', default: false })
  enable_plaid: boolean;

  @Column({ type: 'enum', enum: Flags, default: Flags.N })
  delete_flag: Flags;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;

  @Column({ nullable: true })
  ref_settingid: string;
}
