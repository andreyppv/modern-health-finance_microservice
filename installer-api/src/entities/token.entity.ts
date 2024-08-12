import {
    Entity,
    Column,
    CreateDateColumn,
    BaseEntity,
    PrimaryColumn
  } from 'typeorm';

  @Entity({ name: 'token' })
  export class TokenEntity extends BaseEntity {
    @PrimaryColumn({type: "uuid"})
    id: string;

    @Column()
    token: string;
  
    @CreateDateColumn()
    createdat: Date;
  }
  