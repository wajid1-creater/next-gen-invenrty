import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private repo: Repository<Supplier>,
  ) {}

  create(dto: CreateSupplierDto) {
    const supplier = this.repo.create(dto);
    return this.repo.save(supplier);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' }, relations: ['purchaseOrders'] });
  }

  async findOne(id: string) {
    const supplier = await this.repo.findOne({ where: { id }, relations: ['purchaseOrders'] });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(id: string, data: Partial<CreateSupplierDto>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
