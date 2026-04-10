import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  sku: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  category?: string;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  currentStock?: number;

  @IsOptional()
  @IsNumber()
  reorderLevel?: number;

  @IsOptional()
  unit?: string;
}

export class CreateBomItemDto {
  @IsNotEmpty()
  materialName: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  unit?: string;

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsNotEmpty()
  productId: string;

  @IsOptional()
  supplierId?: string;
}
