import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated
    
  } from 'typeorm';

  export enum Flags {
    N = 'N',
    Y = 'Y'
  }

  
  
@Entity({ name: 'notification' })
export class Notification extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    message: string;

    @Column({default:null})
    link: string;

    @Column({
        type:'enum',
        enum: Flags,
        default: Flags.N,
    })
    delete_flag: Flags;

    @Column({
        type:'enum',
        enum: Flags,
        default: Flags.N,
    })
    adminview: Flags;

    @CreateDateColumn()
    createdat: Date;

    @UpdateDateColumn()
    updatedat: Date;

}

