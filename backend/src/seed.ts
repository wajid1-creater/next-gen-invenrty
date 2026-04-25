import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './users/entities/user.entity';
import { Supplier, SupplierStatus } from './suppliers/entities/supplier.entity';
import { Product } from './products/entities/product.entity';
import {
  PurchaseOrder,
  POStatus,
} from './purchase-orders/entities/purchase-order.entity';
import { Task, TaskStatus, TaskPriority } from './tasks/entities/task.entity';
import {
  Delivery,
  DeliveryStatus,
} from './deliveries/entities/delivery.entity';
import { BomItem } from './products/entities/bom-item.entity';
import {
  Notification,
  NotificationType,
} from './notifications/entities/notification.entity';
import { Forecast } from './forecasting/entities/forecast.entity';

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'mac',
    password: '',
    database: 'next_gen_inventory',
    entities: [
      User,
      Supplier,
      Product,
      PurchaseOrder,
      Task,
      Delivery,
      BomItem,
      Notification,
      Forecast,
    ],
    synchronize: true,
  });

  await ds.initialize();
  console.log('Connected to database');

  // Users
  const userRepo = ds.getRepository(User);
  const hashedPw = await bcrypt.hash('password123', 10);

  const admin = await userRepo.save(
    userRepo.create({
      name: 'Faizan Akram',
      email: 'admin@ngim.com',
      password: hashedPw,
      role: UserRole.ADMIN,
    }),
  );
  const manager = await userRepo.save(
    userRepo.create({
      name: 'Muhammad Wajid',
      email: 'manager@ngim.com',
      password: hashedPw,
      role: UserRole.MANAGER,
    }),
  );
  const supplierUser = await userRepo.save(
    userRepo.create({
      name: 'Ali Supplier',
      email: 'supplier@ngim.com',
      password: hashedPw,
      role: UserRole.SUPPLIER,
    }),
  );
  console.log('Users seeded');

  // Suppliers
  const supplierRepo = ds.getRepository(Supplier);
  const suppliers = await supplierRepo.save([
    supplierRepo.create({
      name: 'TechParts Global',
      email: 'info@techparts.com',
      phone: '+92-300-1234567',
      address: 'Lahore, Pakistan',
      esgScore: 4.2,
      certifications: 'ISO 14001, SA8000',
      status: SupplierStatus.ACTIVE,
    }),
    supplierRepo.create({
      name: 'GreenMaterials Co.',
      email: 'sales@greenmaterials.com',
      phone: '+92-321-9876543',
      address: 'Karachi, Pakistan',
      esgScore: 4.8,
      certifications: 'ISO 14001, B Corp',
      status: SupplierStatus.ACTIVE,
    }),
    supplierRepo.create({
      name: 'RawSupply Ltd.',
      email: 'orders@rawsupply.com',
      phone: '+92-333-5551234',
      address: 'Faisalabad, Pakistan',
      esgScore: 2.5,
      certifications: 'ISO 9001',
      status: SupplierStatus.ACTIVE,
    }),
    supplierRepo.create({
      name: 'PackPro Industries',
      email: 'contact@packpro.com',
      phone: '+92-345-6789012',
      address: 'Islamabad, Pakistan',
      esgScore: 3.1,
      certifications: 'ISO 9001',
      status: SupplierStatus.INACTIVE,
    }),
    supplierRepo.create({
      name: 'FastLogistics Hub',
      email: 'ops@fastlogistics.com',
      phone: '+92-312-3456789',
      address: 'Multan, Pakistan',
      esgScore: 1.8,
      certifications: 'None',
      status: SupplierStatus.SUSPENDED,
    }),
  ]);
  console.log('Suppliers seeded');

  // Products
  const productRepo = ds.getRepository(Product);
  const products = await productRepo.save([
    productRepo.create({
      name: 'Electronic Sensor Module',
      sku: 'ESM-001',
      category: 'Electronics',
      unitPrice: 45.99,
      currentStock: 150,
      reorderLevel: 50,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'Organic Cotton Fabric',
      sku: 'OCF-002',
      category: 'Textiles',
      unitPrice: 12.5,
      currentStock: 8,
      reorderLevel: 30,
      unit: 'meters',
    }),
    productRepo.create({
      name: 'Lithium Battery Cell',
      sku: 'LBC-003',
      category: 'Energy',
      unitPrice: 89.0,
      currentStock: 200,
      reorderLevel: 100,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'Biodegradable Packaging',
      sku: 'BDP-004',
      category: 'Packaging',
      unitPrice: 3.25,
      currentStock: 500,
      reorderLevel: 200,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'Stainless Steel Bolt M10',
      sku: 'SSB-005',
      category: 'Hardware',
      unitPrice: 0.85,
      currentStock: 5,
      reorderLevel: 100,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'LED Display Panel',
      sku: 'LDP-006',
      category: 'Electronics',
      unitPrice: 320.0,
      currentStock: 25,
      reorderLevel: 10,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'Food-Grade Container',
      sku: 'FGC-007',
      category: 'F&B',
      unitPrice: 7.8,
      currentStock: 350,
      reorderLevel: 100,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'Solar Panel 300W',
      sku: 'SP-008',
      category: 'Energy',
      unitPrice: 250.0,
      currentStock: 40,
      reorderLevel: 20,
      unit: 'pcs',
    }),
  ]);
  console.log('Products seeded');

  // BoM Items
  const bomRepo = ds.getRepository(BomItem);
  await bomRepo.save([
    bomRepo.create({
      materialName: 'Copper Wire',
      quantity: 5,
      unit: 'meters',
      unitCost: 2.5,
      productId: products[0].id,
      supplierId: suppliers[0].id,
    }),
    bomRepo.create({
      materialName: 'PCB Board',
      quantity: 1,
      unit: 'pcs',
      unitCost: 15.0,
      productId: products[0].id,
      supplierId: suppliers[0].id,
    }),
    bomRepo.create({
      materialName: 'Lithium Cells',
      quantity: 4,
      unit: 'pcs',
      unitCost: 18.0,
      productId: products[2].id,
      supplierId: suppliers[1].id,
    }),
    bomRepo.create({
      materialName: 'Casing Material',
      quantity: 1,
      unit: 'pcs',
      unitCost: 5.0,
      productId: products[2].id,
      supplierId: suppliers[2].id,
    }),
  ]);
  console.log('BoM items seeded');

  // Purchase Orders
  const poRepo = ds.getRepository(PurchaseOrder);
  const orders = await poRepo.save([
    poRepo.create({
      orderNumber: 'PO-00001',
      supplierId: suppliers[0].id,
      items: [
        {
          productId: products[0].id,
          productName: 'Electronic Sensor Module',
          quantity: 100,
          unitPrice: 45.99,
        },
      ],
      totalAmount: 4599.0,
      status: POStatus.DELIVERED,
      expectedDeliveryDate: new Date('2025-10-15'),
    }),
    poRepo.create({
      orderNumber: 'PO-00002',
      supplierId: suppliers[1].id,
      items: [
        {
          productId: products[1].id,
          productName: 'Organic Cotton Fabric',
          quantity: 200,
          unitPrice: 12.5,
        },
      ],
      totalAmount: 2500.0,
      status: POStatus.SHIPPED,
      expectedDeliveryDate: new Date('2025-11-01'),
    }),
    poRepo.create({
      orderNumber: 'PO-00003',
      supplierId: suppliers[2].id,
      items: [
        {
          productId: products[4].id,
          productName: 'Stainless Steel Bolt M10',
          quantity: 5000,
          unitPrice: 0.85,
        },
      ],
      totalAmount: 4250.0,
      status: POStatus.APPROVED,
      expectedDeliveryDate: new Date('2025-11-15'),
    }),
    poRepo.create({
      orderNumber: 'PO-00004',
      supplierId: suppliers[0].id,
      items: [
        {
          productId: products[2].id,
          productName: 'Lithium Battery Cell',
          quantity: 50,
          unitPrice: 89.0,
        },
        {
          productId: products[5].id,
          productName: 'LED Display Panel',
          quantity: 10,
          unitPrice: 320.0,
        },
      ],
      totalAmount: 7650.0,
      status: POStatus.SUBMITTED,
      expectedDeliveryDate: new Date('2025-12-01'),
    }),
    poRepo.create({
      orderNumber: 'PO-00005',
      supplierId: suppliers[1].id,
      items: [
        {
          productId: products[7].id,
          productName: 'Solar Panel 300W',
          quantity: 20,
          unitPrice: 250.0,
        },
      ],
      totalAmount: 5000.0,
      status: POStatus.DRAFT,
      expectedDeliveryDate: new Date('2025-12-15'),
    }),
  ]);
  console.log('Purchase orders seeded');

  // Deliveries
  const deliveryRepo = ds.getRepository(Delivery);
  await deliveryRepo.save([
    deliveryRepo.create({
      trackingNumber: 'TRK-20251001',
      purchaseOrderId: orders[0].id,
      status: DeliveryStatus.DELIVERED,
      carrier: 'TCS',
      estimatedArrival: new Date('2025-10-15'),
      actualArrival: new Date('2025-10-14'),
    }),
    deliveryRepo.create({
      trackingNumber: 'TRK-20251002',
      purchaseOrderId: orders[1].id,
      status: DeliveryStatus.IN_TRANSIT,
      carrier: 'Leopards',
      estimatedArrival: new Date('2025-11-01'),
    }),
    deliveryRepo.create({
      trackingNumber: 'TRK-20251003',
      purchaseOrderId: orders[2].id,
      status: DeliveryStatus.DELAYED,
      carrier: 'DHL',
      estimatedArrival: new Date('2025-10-20'),
      notes: 'Customs delay at port',
    }),
    deliveryRepo.create({
      trackingNumber: 'TRK-20251004',
      purchaseOrderId: orders[3].id,
      status: DeliveryStatus.PENDING,
      carrier: 'FedEx',
      estimatedArrival: new Date('2025-12-01'),
    }),
  ]);
  console.log('Deliveries seeded');

  // Tasks
  const taskRepo = ds.getRepository(Task);
  await taskRepo.save([
    taskRepo.create({
      title: 'Review supplier ESG compliance reports',
      description: 'Check Q3 ESG reports from all active suppliers',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      department: 'Compliance',
      assignedToId: manager.id,
      createdById: admin.id,
      dueDate: new Date('2025-11-30'),
    }),
    taskRepo.create({
      title: 'Update inventory counts',
      description: 'Physical stock count for warehouse A',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      department: 'Warehouse',
      assignedToId: manager.id,
      createdById: admin.id,
      dueDate: new Date('2025-11-15'),
    }),
    taskRepo.create({
      title: 'Negotiate new packaging contract',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      department: 'Procurement',
      createdById: admin.id,
      dueDate: new Date('2025-12-01'),
    }),
    taskRepo.create({
      title: 'Fix delivery delay for PO-00003',
      description: 'Contact DHL about customs issue',
      status: TaskStatus.REVIEW,
      priority: TaskPriority.URGENT,
      department: 'Logistics',
      assignedToId: manager.id,
      createdById: admin.id,
      dueDate: new Date('2025-11-05'),
    }),
    taskRepo.create({
      title: 'Generate Q4 demand forecast',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      department: 'Analytics',
      assignedToId: admin.id,
      createdById: admin.id,
    }),
  ]);
  console.log('Tasks seeded');

  // Notifications
  const notifRepo = ds.getRepository(Notification);
  await notifRepo.save([
    notifRepo.create({
      title: 'Low Stock Alert',
      message:
        'Organic Cotton Fabric (OCF-002) stock is below reorder level. Current: 8, Reorder Level: 30',
      type: NotificationType.LOW_STOCK,
      userId: admin.id,
    }),
    notifRepo.create({
      title: 'Low Stock Alert',
      message:
        'Stainless Steel Bolt M10 (SSB-005) critically low. Current: 5, Reorder Level: 100',
      type: NotificationType.LOW_STOCK,
      userId: admin.id,
    }),
    notifRepo.create({
      title: 'Delivery Delayed',
      message:
        'Delivery TRK-20251003 for PO-00003 is delayed due to customs issues',
      type: NotificationType.DELIVERY_DELAY,
      userId: admin.id,
    }),
    notifRepo.create({
      title: 'ESG Compliance Warning',
      message:
        'FastLogistics Hub has ESG score below threshold (1.8). Consider reviewing partnership.',
      type: NotificationType.ESG_NON_COMPLIANCE,
      userId: admin.id,
    }),
    notifRepo.create({
      title: 'Task Assigned',
      message: 'You have been assigned: Review supplier ESG compliance reports',
      type: NotificationType.TASK_ASSIGNED,
      userId: manager.id,
    }),
    notifRepo.create({
      title: 'Order Update',
      message: 'PO-00001 has been delivered successfully',
      type: NotificationType.ORDER_STATUS,
      userId: admin.id,
      isRead: true,
    }),
  ]);
  console.log('Notifications seeded');

  // Forecasts
  const forecastRepo = ds.getRepository(Forecast);
  const baseDate = new Date();
  for (const product of products.slice(0, 4)) {
    const forecasts: Forecast[] = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() + i);
      const base = Math.ceil(product.currentStock * 0.3) || 30;
      const seasonal =
        Math.sin((d.getMonth() / 12) * Math.PI * 2) * base * 0.15;
      forecasts.push(
        forecastRepo.create({
          productId: product.id,
          forecastDate: d,
          predictedDemand: Math.max(
            5,
            Math.round(base + seasonal + Math.random() * 10),
          ),
          confidence: Math.max(55, 95 - i * 6),
          model: 'moving_average_trend',
        }),
      );
    }
    await forecastRepo.save(forecasts);
  }
  console.log('Forecasts seeded');

  console.log('\n=== Seed Complete ===');
  console.log('Login credentials:');
  console.log('  Admin:    admin@ngim.com / password123');
  console.log('  Manager:  manager@ngim.com / password123');
  console.log('  Supplier: supplier@ngim.com / password123');

  await ds.destroy();
}

seed().catch(console.error);
