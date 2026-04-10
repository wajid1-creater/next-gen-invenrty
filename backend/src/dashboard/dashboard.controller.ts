import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('overview')
  getOverview() {
    return this.service.getOverview();
  }

  @Get('orders-by-status')
  getOrdersByStatus() {
    return this.service.getOrdersByStatus();
  }

  @Get('delivery-performance')
  getDeliveryPerformance() {
    return this.service.getDeliveryPerformance();
  }

  @Get('top-suppliers')
  getTopSuppliers() {
    return this.service.getTopSuppliers();
  }

  @Get('monthly-spend')
  getMonthlySpend() {
    return this.service.getMonthlySpend();
  }
}
