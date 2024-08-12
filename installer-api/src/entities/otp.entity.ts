import {
    Entity,
    Column,
    CreateDateColumn,
    BaseEntity,
    PrimaryColumn,
    UpdateDateColumn
  } from 'typeorm';

  @Entity({ name: 'otp' })
  export class OtpEntity extends BaseEntity {
    @PrimaryColumn({type: "uuid"})
    user_id: string;

    @Column()
    otp: number;
  
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdat: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedat: Date;

    @Column({default: null})
    checktime: string;
  }
  