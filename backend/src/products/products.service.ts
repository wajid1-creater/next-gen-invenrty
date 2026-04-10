import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { BomItem } from './entities/bom-item.entity';
import { CreateProductDto, CreateBomItemDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(BomItem) private bomRepo: Repository<BomItem>,
  ) {}

  create(dto: CreateProductDto) {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  findAll() {
    return this.productRepo.find({ order: { createdAt: 'DESC' }, relations: ['bomItems'] });
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['bomItems', 'bomItems.supplier'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, data: Partial<CreateProductDto>) {
    await this.productRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.productRepo.delete(id);
    return { deleted: true };
  }

  // BoM operations
  addBomItem(dto: CreateBomItemDto) {
    const item = this.bomRepo.create(dto);
    return this.bomRepo.save(item);
  }

  getBomByProduct(productId: string) {
    return this.bomRepo.find({ where: { productId }, relations: ['supplier'] });
  }

  async removeBomItem(id: string) {
    await this.bomRepo.delete(id);
    return { deleted: true };
  }

  getLowStockProducts() {
    return this.productRepo
      .createQueryBuilder('p')
      .where('p.currentStock <= p.reorderLevel')
      .getMany();
  }
}
