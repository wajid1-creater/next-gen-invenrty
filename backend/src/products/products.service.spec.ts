import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { BomItem } from './entities/bom-item.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let bomRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    productRepo = {
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ id: 'p-1', ...x })),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    bomRepo = {
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ id: 'b-1', ...x })),
      find: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: getRepositoryToken(BomItem), useValue: bomRepo },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('create persists a product and returns the saved row', async () => {
    const result = await service.create({ name: 'Widget' } as any);
    expect(productRepo.create).toHaveBeenCalledWith({ name: 'Widget' });
    expect(result).toEqual({ id: 'p-1', name: 'Widget' });
  });

  it('findOne throws NotFoundException when missing', async () => {
    productRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findOne returns product with bom relations loaded', async () => {
    const row = { id: 'p-1', name: 'Widget', bomItems: [] };
    productRepo.findOne.mockResolvedValueOnce(row);
    await expect(service.findOne('p-1')).resolves.toEqual(row);
    expect(productRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        relations: ['bomItems', 'bomItems.supplier'],
      }),
    );
  });

  it('getLowStockProducts queries stock <= reorderLevel', async () => {
    const getMany = jest.fn().mockResolvedValue([{ id: 'p-1' }]);
    const where = jest.fn().mockReturnValue({ getMany });
    productRepo.createQueryBuilder.mockReturnValueOnce({ where });

    await expect(service.getLowStockProducts()).resolves.toEqual([
      { id: 'p-1' },
    ]);
    expect(where).toHaveBeenCalledWith('p.currentStock <= p.reorderLevel');
  });
});
