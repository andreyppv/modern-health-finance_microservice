import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
@Entity({ name: 'stateservice' })
export class stateservice extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  state_code: string;

  @Column()
  state_service: string;

  @Column({ type: 'float', default: null })
  apr: number;

  @Column({ default: true })
  isvisible: boolean;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
