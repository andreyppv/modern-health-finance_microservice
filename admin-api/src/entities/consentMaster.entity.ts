import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated,
} from 'typeorm';

@Entity({ name: 'consentmaster' })
export class ConsentMasterEnity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id_consent: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  filename: string;

  @Column({ nullable: true })
  filekey: number;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
