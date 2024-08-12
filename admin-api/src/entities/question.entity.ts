import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity
    
  } from 'typeorm';

  export enum Flags {
    N = 'N',
    Y = 'Y'
  }

  export enum Type {
    Yes_or_no = 'Yes_or_no',
    Value = 'Value',
    Free_style = 'Free_style'
  }

  export enum Condition {
    con1 = '=',
    con2 = '>',
    con3 = '<',
    con4 = '>=',
    con5 = '<='
  }
  
@Entity({ name: 'question' })
export class Questions extends BaseEntity {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column()
question: string;

@Column({
    type:'enum',
    enum: Flags,
    default: Flags.N,
})
delete_flag: Flags;

@Column({
  type:'enum',
  enum: Type,
  default: Type.Yes_or_no,
})
type: Type;

@Column({
  type:'enum',
  enum: Condition,
  default: Condition.con1,
})
condition: Condition;

@Column({default:"yes"})
approvedif	: string;

@CreateDateColumn()
createdat: Date;

@UpdateDateColumn()
updatedat: Date;

}
