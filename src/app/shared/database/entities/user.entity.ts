import { Entity, Column, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';
import { TaskEntity } from './task.entity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({
    name: 'data_criacao',
  })
  dataCriacao: Date;

  @UpdateDateColumn({
    name: 'data_atualizacao',
  })
  dataAtualizacao: Date;

  @OneToMany(() => TaskEntity, (task) => task.userId)
  tasks: TaskEntity[];
}
