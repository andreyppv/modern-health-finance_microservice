import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity
    
  } from 'typeorm';
  
@Entity({ name: 'settings' })
export class SettingsEntity extends BaseEntity {
@PrimaryGeneratedColumn()
id: number;

@Column()
key: string;

@Column()
value: string;

}

