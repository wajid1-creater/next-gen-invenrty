import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('forecasts')
export class Forecast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @Column({ type: 'date' })
  forecastDate: Date;

  @Column({ type: 'int' })
  predictedDemand: number;

  @Column({ type: 'int', nullable: true })
  actualDemand: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence: number;

  @Column({ nullable: true })
  model: string;

  @CreateDateColumn()
  createdAt: Date;
}
