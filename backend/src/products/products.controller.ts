import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, CreateBomItemDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('low-stock')
  getLowStock() {
    return this.service.getLowStockProducts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // BoM
  @Post('bom')
  addBomItem(@Body() dto: CreateBomItemDto) {
    return this.service.addBomItem(dto);
  }

  @Get(':id/bom')
  getBom(@Param('id') id: string) {
    return this.service.getBomByProduct(id);
  }

  @Delete('bom/:id')
  removeBomItem(@Param('id') id: string) {
    return this.service.removeBomItem(id);
  }
}
