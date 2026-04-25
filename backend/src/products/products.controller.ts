import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, CreateBomItemDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.service.findAll(pagination);
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
