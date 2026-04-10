import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Delivery } from '../deliveries/entities/delivery.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Supplier, PurchaseOrder, Delivery, Task])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
