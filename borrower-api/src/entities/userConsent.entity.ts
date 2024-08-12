import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity,
    Generated,
  } from 'typeorm';
  
  @Entity({ name: 'userconsent' })
  export class userConsentEnity extends BaseEntity {
    @PrimaryGeneratedColumn()
    ref_no: number;
  
    @Column()
    @Generated('uuid')
    id: string;
  
    @Column({ default: null })
    loanid: string;
  
    @Column({ default: null })
    filekey: number;
  
    @Column({ default: null })
    filepath: string;
  
    @CreateDateColumn()
    createdat: Date;
  
    @UpdateDateColumn()
    updatedat: Date;
  }
  