import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import {
  buildPage,
  type Page,
  type PaginationQueryDto,
} from '../common/dto/pagination.dto';

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

  async findAll(query: PaginationQueryDto): Promise<Page<Supplier>> {
    const where = query.q
      ? [{ name: ILike(`%${query.q}%`) }, { email: ILike(`%${query.q}%`) }]
      : undefined;
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      relations: ['purchaseOrders'],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return buildPage(items, total, query);
  }

  async findOne(id: string) {
    const supplier = await this.repo.findOne({
      where: { id },
      relations: ['purchaseOrders'],
    });
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
