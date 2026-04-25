import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { SupplierStatus } from '../entities/supplier.entity';

export class CreateSupplierDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  esgScore?: number;

  @IsOptional()
  certifications?: string;
}
