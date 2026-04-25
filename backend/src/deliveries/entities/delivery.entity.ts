import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PurchaseOrder } from '../../purchase-orders/entities/purchase-order.entity';

export enum DeliveryStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  DELAYED = 'delayed',
  RETURNED = 'returned',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  trackingNumber: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.deliveries)
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: PurchaseOrder;

  @Column()
  purchaseOrderId: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @Column({ type: 'date', nullable: true })
  estimatedArrival: Date;

  @Column({ type: 'date', nullable: true })
  actualArrival: Date;

  @Column({ nullable: true })
  carrier: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
