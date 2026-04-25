import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  LOW_STOCK = 'low_stock',
  DELIVERY_DELAY = 'delivery_delay',
  ESG_NON_COMPLIANCE = 'esg_non_compliance',
  TASK_ASSIGNED = 'task_assigned',
  ORDER_STATUS = 'order_status',
  GENERAL = 'general',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.GENERAL,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
