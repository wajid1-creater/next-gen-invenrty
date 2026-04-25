import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Delivery } from '../../deliveries/entities/delivery.entity';

export enum POStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchaseOrders)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column()
  supplierId: string;

  @Column({ type: 'jsonb', default: '[]' })
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'enum', enum: POStatus, default: POStatus.DRAFT })
  status: POStatus;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => Delivery, (d) => d.purchaseOrder)
  deliveries: Delivery[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
