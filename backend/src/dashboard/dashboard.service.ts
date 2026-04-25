import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Delivery } from '../deliveries/entities/delivery.entity';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
    @InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(Delivery) private deliveryRepo: Repository<Delivery>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
  ) {}

  async getOverview() {
    const [
      totalProducts,
      totalSuppliers,
      totalOrders,
      totalDeliveries,
      totalTasks,
    ] = await Promise.all([
      this.productRepo.count(),
      this.supplierRepo.count(),
      this.poRepo.count(),
      this.deliveryRepo.count(),
      this.taskRepo.count(),
    ]);

    const lowStockProducts = await this.productRepo
      .createQueryBuilder('p')
      .where('p.currentStock <= p.reorderLevel')
      .getCount();

    const pendingOrders = await this.poRepo.count({
      where: [{ status: 'draft' as any }, { status: 'submitted' as any }],
    });

    const delayedDeliveries = await this.deliveryRepo.count({
      where: { status: 'delayed' as any },
    });

    const completedTasks = await this.taskRepo.count({
      where: { status: 'completed' as any },
    });

    const totalOrderValue = await this.poRepo
      .createQueryBuilder('po')
      .select('COALESCE(SUM(po.totalAmount), 0)', 'total')
      .getRawOne();

    const avgEsgScore = await this.supplierRepo
      .createQueryBuilder('s')
      .select('COALESCE(AVG(s.esgScore), 0)', 'avg')
      .getRawOne();

    return {
      totalProducts,
      totalSuppliers,
      totalOrders,
      totalDeliveries,
      totalTasks,
      lowStockProducts,
      pendingOrders,
      delayedDeliveries,
      completedTasks,
      taskCompletionRate: totalTasks
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0,
      totalOrderValue: parseFloat(totalOrderValue.total),
      avgEsgScore: parseFloat(parseFloat(avgEsgScore.avg).toFixed(2)),
    };
  }

  async getOrdersByStatus() {
    return this.poRepo
      .createQueryBuilder('po')
      .select('po.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('po.status')
      .getRawMany();
  }

  async getDeliveryPerformance() {
    return this.deliveryRepo
      .createQueryBuilder('d')
      .select('d.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('d.status')
      .getRawMany();
  }

  async getTopSuppliers() {
    return this.supplierRepo
      .createQueryBuilder('s')
      .leftJoin('s.purchaseOrders', 'po')
      .select('s.id', 'id')
      .addSelect('s.name', 'name')
      .addSelect('s.esgScore', 'esgScore')
      .addSelect('COUNT(po.id)', 'orderCount')
      .addSelect('COALESCE(SUM(po.totalAmount), 0)', 'totalValue')
      .groupBy('s.id')
      .addGroupBy('s.name')
      .addGroupBy('s.esgScore')
      .orderBy('totalValue', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getMonthlySpend() {
    return this.poRepo
      .createQueryBuilder('po')
      .select("TO_CHAR(po.createdAt, 'YYYY-MM')", 'month')
      .addSelect('SUM(po.totalAmount)', 'total')
      .groupBy("TO_CHAR(po.createdAt, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();
  }
}
