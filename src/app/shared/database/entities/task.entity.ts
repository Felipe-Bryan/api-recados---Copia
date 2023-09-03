import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('tasks')
export class TaskEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  detail: string;

  @Column()
  description: string;

  @CreateDateColumn({
    name: 'data_criacao',
  })
  dataCriacao: Date;

  @UpdateDateColumn({
    name: 'data_atualizacao',
  })
  dataAtualizacao: Date;

  @Column({ name: 'id_usuario', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'id_usuario',
  })
  user: UserEntity;
}
