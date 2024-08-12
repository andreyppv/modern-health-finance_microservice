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

  
@Entity({ name: 'historicalbalance' })
export class HistoricalBalanceEntity extends BaseEntity {
@Column()
@PrimaryGeneratedColumn("uuid")
id: string;

@Column({type:"uuid"})
bankaccountid: string;

@Column({type: "float"})
amount: number;

@Column({default:null})
date:Date;

@Column({default:null})
currency:string;

@CreateDateColumn()
createdat: Date;

@UpdateDateColumn()
updatedat: Date;

}

