import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { InboxTypes } from '../inbox.types';
import { IEvent } from '@app/contracts';

@Entity()
export class Inbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  processed: boolean;

  @Column()
  type: InboxTypes;

  @Column({ type: 'json' })
  event: IEvent;

  @CreateDateColumn()
  createdAt: Date;
}
