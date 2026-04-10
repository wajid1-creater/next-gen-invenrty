import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { CreatePurchaseOrderDto } from './dto/create-po.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private repo: Repository<PurchaseOrder>,
  ) {}

  async create(dto: CreatePurchaseOrderDto) {
    const count = await this.repo.count();
    const orderNumber = `PO-${String(count + 1).padStart(5, '0')}`;
    const totalAmount = dto.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const po = this.repo.create({ ...dto, orderNumber, totalAmount });
    return this.repo.save(po);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' }, relations: ['supplier', 'deliveries'] });
  }

  async findOne(id: string) {
    const po = await this.repo.findOne({
      where: { id },
      relations: ['supplier', 'deliveries'],
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async update(id: string, data: Partial<CreatePurchaseOrderDto>) {
    if (data.items) {
      (data as any).totalAmount = data.items.reduce(
        (sum, i) => sum + i.quantity * i.unitPrice,
        0,
      );
    }
    await this.repo.update(id, data as any);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
