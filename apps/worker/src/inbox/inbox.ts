import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { InboxTypes } from './inbox.types';
import { UUID } from 'node:crypto';
import { IEventPayload } from '@app/contracts';

@Entity()
export class Inbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: InboxTypes;

  @Column({ type: 'uuid' })
  userId: UUID;

  @Column({ default: false })
  isProcessed: boolean;

  @Column({ type: 'json' })
  payload: IEventPayload;

  @CreateDateColumn()
  createdAt: Date;
}
