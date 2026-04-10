import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private repo: Repository<Delivery>,
  ) {}

  create(dto: CreateDeliveryDto) {
    const trackingNumber = dto.trackingNumber || `TRK-${Date.now()}`;
    const delivery = this.repo.create({ ...dto, trackingNumber });
    return this.repo.save(delivery);
  }

  findAll() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      relations: ['purchaseOrder', 'purchaseOrder.supplier'],
    });
  }

  async findOne(id: string) {
    const d = await this.repo.findOne({
      where: { id },
      relations: ['purchaseOrder', 'purchaseOrder.supplier'],
    });
    if (!d) throw new NotFoundException('Delivery not found');
    return d;
  }

  async update(id: string, data: Partial<CreateDeliveryDto>) {
    await this.repo.update(id, data as any);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { deleted: true };
  }

  getDelayed() {
    return this.repo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.purchaseOrder', 'po')
      .leftJoinAndSelect('po.supplier', 's')
      .where('d.status = :status', { status: 'delayed' })
      .orWhere('d.estimatedArrival < CURRENT_DATE AND d.status != :delivered', {
        delivered: 'delivered',
      })
      .getMany();
  }
}
