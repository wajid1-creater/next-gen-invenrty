import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ForecastingService } from './forecasting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('forecasting')
@UseGuards(JwtAuthGuard)
export class ForecastingController {
  constructor(private service: ForecastingService) {}

  @Post('generate/:productId')
  generate(
    @Param('productId') productId: string,
    @Query('periods') periods?: string,
  ) {
    return this.service.generateForecast(productId, periods ? parseInt(periods) : 6);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('shortages')
  getShortages() {
    return this.service.getShortageAlerts();
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.service.findByProduct(productId);
  }
}
