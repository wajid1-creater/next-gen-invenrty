import { IsNotEmpty, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { POStatus } from '../entities/purchase-order.entity';

export class CreatePurchaseOrderDto {
  @IsNotEmpty()
  supplierId: string;

  @IsArray()
  items: { productId: string; productName: string; quantity: number; unitPrice: number }[];

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsEnum(POStatus)
  status?: POStatus;

  @IsOptional()
  expectedDeliveryDate?: string;

  @IsOptional()
  notes?: string;
}
