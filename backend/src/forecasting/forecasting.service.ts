import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Forecast } from './entities/forecast.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ForecastingService {
  constructor(
    @InjectRepository(Forecast) private forecastRepo: Repository<Forecast>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  /**
   * Simple ARIMA-like forecasting using moving average + trend.
   * For a production system you'd use a Python microservice with statsmodels.
   */
  async generateForecast(productId: string, periods: number = 6) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new Error('Product not found');

    // Get historical forecasts as proxy for demand history
    const history = await this.forecastRepo.find({
      where: { productId },
      order: { forecastDate: 'ASC' },
    });

    const forecasts: Forecast[] = [];
    const baseDate = new Date();

    for (let i = 1; i <= periods; i++) {
      const forecastDate = new Date(baseDate);
      forecastDate.setMonth(forecastDate.getMonth() + i);

      // Simple moving average with seasonal adjustment
      const baseDemand =
        product.currentStock > 0 ? Math.ceil(product.currentStock * 0.3) : 50;
      const trend =
        history.length > 1
          ? (history[history.length - 1]?.predictedDemand -
              history[0]?.predictedDemand) /
            history.length
          : 0;
      const seasonal =
        Math.sin((forecastDate.getMonth() / 12) * Math.PI * 2) *
        baseDemand *
        0.15;
      const predicted = Math.max(
        1,
        Math.round(baseDemand + trend * i + seasonal),
      );
      const confidence = Math.max(50, 95 - i * 5);

      const forecast = this.forecastRepo.create({
        productId,
        forecastDate,
        predictedDemand: predicted,
        confidence,
        model: 'moving_average_trend',
      });
      forecasts.push(forecast);
    }

    return this.forecastRepo.save(forecasts);
  }

  findByProduct(productId: string) {
    return this.forecastRepo.find({
      where: { productId },
      order: { forecastDate: 'ASC' },
      relations: ['product'],
    });
  }

  findAll() {
    return this.forecastRepo.find({
      order: { forecastDate: 'ASC' },
      relations: ['product'],
    });
  }

  async getShortageAlerts() {
    const products = await this.productRepo.find();
    const alerts: any[] = [];

    for (const product of products) {
      const forecasts = await this.forecastRepo.find({
        where: { productId: product.id },
        order: { forecastDate: 'ASC' },
        take: 3,
      });

      const totalPredicted = forecasts.reduce(
        (s, f) => s + f.predictedDemand,
        0,
      );
      if (totalPredicted > product.currentStock) {
        alerts.push({
          product,
          currentStock: product.currentStock,
          predictedDemand3Months: totalPredicted,
          shortageAmount: totalPredicted - product.currentStock,
          severity:
            product.currentStock === 0
              ? 'critical'
              : product.currentStock < product.reorderLevel
                ? 'high'
                : 'medium',
        });
      }
    }

    return alerts;
  }
}
