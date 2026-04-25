import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { BomItem } from './entities/bom-item.entity';
import { CreateProductDto, CreateBomItemDto } from './dto/create-product.dto';
import {
  buildPage,
  type Page,
  type PaginationQueryDto,
} from '../common/dto/pagination.dto';

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

  async findAll(query: PaginationQueryDto): Promise<Page<Product>> {
    const where = query.q
      ? [{ name: ILike(`%${query.q}%`) }, { sku: ILike(`%${query.q}%`) }]
      : undefined;
    const [items, total] = await this.productRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      relations: ['bomItems'],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return buildPage(items, total, query);
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
