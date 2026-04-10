import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BomItem } from './bom-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  sku: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ type: 'int', default: 0 })
  currentStock: number;

  @Column({ type: 'int', default: 10 })
  reorderLevel: number;

  @Column({ nullable: true })
  unit: string;

  @OneToMany(() => BomItem, (bom) => bom.product)
  bomItems: BomItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
