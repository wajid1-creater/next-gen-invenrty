import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('bom_items')
export class BomItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  materialName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitCost: number;

  @ManyToOne(() => Product, (product) => product.bomItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ nullable: true })
  supplierId: string;
}
