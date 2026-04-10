import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { DeliveryStatus } from '../entities/delivery.entity';

export class CreateDeliveryDto {
  @IsNotEmpty()
  purchaseOrderId: string;

  @IsOptional()
  trackingNumber?: string;

  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;

  @IsOptional()
  estimatedArrival?: string;

  @IsOptional()
  actualArrival?: string;

  @IsOptional()
  carrier?: string;

  @IsOptional()
  notes?: string;
}
