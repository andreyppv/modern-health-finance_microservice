import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  Generated,
} from 'typeorm';

@Entity({ name: 'aggrement' })
export class aggrementEnity extends BaseEntity {
  @PrimaryGeneratedColumn()
  ref_no: number;

  @Column()
  @Generated('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  orginalfilename: string;

  @Column()
  type: string;

  @Column()
  filekey: number;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;

  // addtional for final db


@Column()
documentkey: string;

@Column()
documentbody: string;

@Column()
active: boolean;

@Column()
documentpath: string;

@Column()
practicemanagement: string;


@Column()
documentversion: string;

@Column()
__hevo__ingested_at: string;

@Column()
__hevo__marked_deleted: string;

@Column()
__hevo__source_modified_at: string;


@PrimaryGeneratedColumn()
__hevo__database_name: string;

@PrimaryGeneratedColumn()
__hevo_id: string; 

}
