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

/** Set createdAt to a backdated value via raw SQL — TypeORM blocks updates on @CreateDateColumn. */
async function setCreatedAt(
  ds: DataSource,
  table: string,
  id: string,
  date: Date,
): Promise<void> {
  await ds.query(`UPDATE "${table}" SET "createdAt" = $1 WHERE id = $2`, [
    date,
    id,
  ]);
}

/** Pick from a list. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Date n months ago from now, with optional day offset. */
function monthsAgo(n: number, dayOffset = 0): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(Math.max(1, Math.min(28, 5 + dayOffset)));
  d.setHours(10, 0, 0, 0);
  return d;
}

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

  // Idempotent: wipe all domain rows so re-running the seed doesn't blow up on
  // unique constraints. CASCADE catches audit_logs / refresh_tokens too.
  await ds.query(`
    TRUNCATE TABLE
      forecasts,
      notifications,
      tasks,
      deliveries,
      purchase_orders,
      bom_items,
      products,
      suppliers,
      audit_logs,
      refresh_tokens,
      users
    RESTART IDENTITY CASCADE
  `);
  console.log('Cleared existing data');

  /* ─────────── Users ─────────── */
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
  const adminTwo = await userRepo.save(
    userRepo.create({
      name: 'Sara Khan',
      email: 'sara.admin@ngim.com',
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
  const managers = [
    manager,
    await userRepo.save(
      userRepo.create({
        name: 'Ayesha Malik',
        email: 'ayesha.manager@ngim.com',
        password: hashedPw,
        role: UserRole.MANAGER,
      }),
    ),
    await userRepo.save(
      userRepo.create({
        name: 'Bilal Hussain',
        email: 'bilal.manager@ngim.com',
        password: hashedPw,
        role: UserRole.MANAGER,
      }),
    ),
    await userRepo.save(
      userRepo.create({
        name: 'Hina Raza',
        email: 'hina.manager@ngim.com',
        password: hashedPw,
        role: UserRole.MANAGER,
      }),
    ),
    await userRepo.save(
      userRepo.create({
        name: 'Imran Yousaf',
        email: 'imran.manager@ngim.com',
        password: hashedPw,
        role: UserRole.MANAGER,
      }),
    ),
  ];
  const supplierUser = await userRepo.save(
    userRepo.create({
      name: 'Ali Supplier',
      email: 'supplier@ngim.com',
      password: hashedPw,
      role: UserRole.SUPPLIER,
    }),
  );
  await userRepo.save([
    userRepo.create({
      name: 'Zara Iqbal',
      email: 'zara.supplier@ngim.com',
      password: hashedPw,
      role: UserRole.SUPPLIER,
    }),
    userRepo.create({
      name: 'Omar Farooq',
      email: 'omar.supplier@ngim.com',
      password: hashedPw,
      role: UserRole.SUPPLIER,
    }),
  ]);
  console.log('Users seeded (8 total)');

  /* ─────────── Suppliers ─────────── */
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
      status: SupplierStatus.ACTIVE,
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
    supplierRepo.create({
      name: 'EcoSteel Works',
      email: 'sales@ecosteel.com',
      phone: '+92-301-1112222',
      address: 'Sialkot, Pakistan',
      esgScore: 4.0,
      certifications: 'ISO 14001',
      status: SupplierStatus.ACTIVE,
    }),
    supplierRepo.create({
      name: 'Premier Plastics',
      email: 'team@premier-plastics.com',
      phone: '+92-322-7778888',
      address: 'Gujranwala, Pakistan',
      esgScore: 2.2,
      certifications: 'ISO 9001',
      status: SupplierStatus.ACTIVE,
    }),
    supplierRepo.create({
      name: 'Solaris Energy',
      email: 'hello@solaris-energy.com',
      phone: '+92-313-3334444',
      address: 'Rawalpindi, Pakistan',
      esgScore: 4.6,
      certifications: 'ISO 14001, B Corp',
      status: SupplierStatus.ACTIVE,
    }),
    supplierRepo.create({
      name: 'BluePrint Components',
      email: 'orders@blueprint-co.com',
      phone: '+92-302-5556666',
      address: 'Peshawar, Pakistan',
      esgScore: 3.4,
      certifications: 'ISO 9001, ISO 14001',
      status: SupplierStatus.ACTIVE,
    }),
    supplierRepo.create({
      name: 'AgriHarvest Co-op',
      email: 'farms@agriharvest.com',
      phone: '+92-300-9990000',
      address: 'Quetta, Pakistan',
      esgScore: 4.4,
      certifications: 'Fair Trade, Organic',
      status: SupplierStatus.INACTIVE,
    }),
  ]);
  console.log('Suppliers seeded (10 total)');

  /* ─────────── Products ─────────── */
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
    productRepo.create({
      name: 'Recycled Paper Roll',
      sku: 'RPR-009',
      category: 'Packaging',
      unitPrice: 4.5,
      currentStock: 120,
      reorderLevel: 60,
      unit: 'rolls',
    }),
    productRepo.create({
      name: 'Aluminium Sheet 2mm',
      sku: 'AS2-010',
      category: 'Hardware',
      unitPrice: 18.0,
      currentStock: 75,
      reorderLevel: 30,
      unit: 'sheets',
    }),
    productRepo.create({
      name: 'Microcontroller Board',
      sku: 'MCB-011',
      category: 'Electronics',
      unitPrice: 22.5,
      currentStock: 12,
      reorderLevel: 40,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'Solar Inverter 5kW',
      sku: 'SI5-012',
      category: 'Energy',
      unitPrice: 480.0,
      currentStock: 18,
      reorderLevel: 8,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'Hemp Twine Roll',
      sku: 'HTR-013',
      category: 'Textiles',
      unitPrice: 6.75,
      currentStock: 200,
      reorderLevel: 80,
      unit: 'rolls',
    }),
    productRepo.create({
      name: 'Glass Jar 500ml',
      sku: 'GJ5-014',
      category: 'F&B',
      unitPrice: 1.2,
      currentStock: 800,
      reorderLevel: 300,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'Power Cable 14AWG',
      sku: 'PC14-015',
      category: 'Electronics',
      unitPrice: 2.1,
      currentStock: 9,
      reorderLevel: 100,
      unit: 'meters',
    }),
    productRepo.create({
      name: 'Compostable Cup 12oz',
      sku: 'CC12-016',
      category: 'Packaging',
      unitPrice: 0.32,
      currentStock: 4500,
      reorderLevel: 1000,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'Industrial Bearing 6204',
      sku: 'IB-017',
      category: 'Hardware',
      unitPrice: 4.8,
      currentStock: 60,
      reorderLevel: 25,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'Wool Blend Yarn 100g',
      sku: 'WBY-018',
      category: 'Textiles',
      unitPrice: 9.4,
      currentStock: 220,
      reorderLevel: 50,
      unit: 'skeins',
    }),
    productRepo.create({
      name: 'Wind Turbine Blade Mini',
      sku: 'WTB-019',
      category: 'Energy',
      unitPrice: 95.0,
      currentStock: 14,
      reorderLevel: 6,
      unit: 'pcs',
    }),
    productRepo.create({
      name: 'Sealed Bearing Kit',
      sku: 'SBK-020',
      category: 'Hardware',
      unitPrice: 14.5,
      currentStock: 28,
      reorderLevel: 30,
      unit: 'kits',
    }),
  ]);
  console.log('Products seeded (20 total)');

  /* ─────────── BoM Items ─────────── */
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
    bomRepo.create({
      materialName: 'Photovoltaic Cell',
      quantity: 36,
      unit: 'pcs',
      unitCost: 4.2,
      productId: products[7].id,
      supplierId: suppliers[7].id,
    }),
    bomRepo.create({
      materialName: 'Aluminium Frame',
      quantity: 1,
      unit: 'pcs',
      unitCost: 22.0,
      productId: products[7].id,
      supplierId: suppliers[5].id,
    }),
    bomRepo.create({
      materialName: 'ARM Cortex Chip',
      quantity: 1,
      unit: 'pcs',
      unitCost: 8.5,
      productId: products[10].id,
      supplierId: suppliers[8].id,
    }),
    bomRepo.create({
      materialName: 'PLA Bioplastic',
      quantity: 1,
      unit: 'kg',
      unitCost: 6.0,
      productId: products[15].id,
      supplierId: suppliers[1].id,
    }),
  ]);
  console.log('BoM items seeded');

  /* ─────────── Purchase Orders (backdated across 12 months) ─────────── */
  const poRepo = ds.getRepository(PurchaseOrder);

  // 36 POs spread across the past 12 months — 3 per month average. Status,
  // supplier, items, value all vary so charts have signal.
  const poStatuses: POStatus[] = [
    POStatus.DELIVERED,
    POStatus.DELIVERED,
    POStatus.DELIVERED,
    POStatus.SHIPPED,
    POStatus.APPROVED,
    POStatus.SUBMITTED,
    POStatus.DRAFT,
    POStatus.CANCELLED,
  ];

  const orders: PurchaseOrder[] = [];
  let orderSeq = 1;
  for (let monthBack = 11; monthBack >= 0; monthBack--) {
    // 2-4 POs per month for a denser monthly spend curve
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const supplier = pick(suppliers);
      const itemCount = 1 + Math.floor(Math.random() * 3);
      const items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
      }> = [];
      let total = 0;
      for (let j = 0; j < itemCount; j++) {
        const product = pick(products);
        const qty = 10 + Math.floor(Math.random() * 200);
        const price = Number(product.unitPrice);
        items.push({
          productId: product.id,
          productName: product.name,
          quantity: qty,
          unitPrice: price,
        });
        total += qty * price;
      }
      // Older orders skew toward delivered; recent ones are more often pending.
      const status =
        monthBack >= 4
          ? pick([
              POStatus.DELIVERED,
              POStatus.DELIVERED,
              POStatus.DELIVERED,
              POStatus.CANCELLED,
            ])
          : pick(poStatuses);

      const createdAt = monthsAgo(monthBack, i * 7);
      const expected = new Date(createdAt);
      expected.setDate(
        expected.getDate() + 14 + Math.floor(Math.random() * 14),
      );

      const po = await poRepo.save(
        poRepo.create({
          orderNumber: `PO-${String(orderSeq++).padStart(5, '0')}`,
          supplierId: supplier.id,
          items,
          totalAmount: Number(total.toFixed(2)),
          status,
          expectedDeliveryDate: expected,
        }),
      );
      await setCreatedAt(ds, 'purchase_orders', po.id, createdAt);
      orders.push(po);
    }
  }
  console.log(`Purchase orders seeded (${orders.length} across 12 months)`);

  /* ─────────── Deliveries ─────────── */
  const deliveryRepo = ds.getRepository(Delivery);
  const carriers = ['TCS', 'Leopards', 'DHL', 'FedEx', 'M&P', 'BlueEx'];
  const deliveryRows: Delivery[] = [];
  let trackingSeq = 1;

  for (const order of orders) {
    // Only orders past the "approved" stage have deliveries
    if (
      order.status === POStatus.DRAFT ||
      order.status === POStatus.SUBMITTED ||
      order.status === POStatus.CANCELLED
    ) {
      continue;
    }

    const status =
      order.status === POStatus.DELIVERED
        ? DeliveryStatus.DELIVERED
        : order.status === POStatus.SHIPPED
          ? pick([
              DeliveryStatus.IN_TRANSIT,
              DeliveryStatus.IN_TRANSIT,
              DeliveryStatus.DELAYED,
            ])
          : DeliveryStatus.PENDING;

    const estimated = order.expectedDeliveryDate ?? new Date();
    const partial: Partial<Delivery> = {
      trackingNumber: `TRK-${String(trackingSeq++).padStart(8, '0')}`,
      purchaseOrderId: order.id,
      status,
      carrier: pick(carriers),
      estimatedArrival: estimated,
    };
    if (status === DeliveryStatus.DELIVERED) {
      partial.actualArrival = new Date(
        estimated.getTime() - Math.random() * 4 * 86400000,
      );
    }
    if (status === DeliveryStatus.DELAYED) {
      partial.notes = 'Customs delay at port';
    }
    deliveryRows.push(deliveryRepo.create(partial));
  }
  // A couple of explicit returned-status deliveries for chart variety
  if (orders.length > 2) {
    const returnedPartial: Partial<Delivery> = {
      trackingNumber: `TRK-${String(trackingSeq++).padStart(8, '0')}`,
      purchaseOrderId: orders[0].id,
      status: DeliveryStatus.RETURNED,
      carrier: 'DHL',
      estimatedArrival: new Date(),
      notes: 'Damaged in transit',
    };
    deliveryRows.push(deliveryRepo.create(returnedPartial));
  }
  await deliveryRepo.save(deliveryRows);
  console.log(`Deliveries seeded (${deliveryRows.length})`);

  /* ─────────── Tasks ─────────── */
  const taskRepo = ds.getRepository(Task);
  await taskRepo.save([
    taskRepo.create({
      title: 'Review supplier ESG compliance reports',
      description: 'Check Q3 ESG reports from all active suppliers',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      department: 'Compliance',
      assignedToId: managers[0].id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 14 * 86400000),
    }),
    taskRepo.create({
      title: 'Update inventory counts',
      description: 'Physical stock count for warehouse A',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      department: 'Warehouse',
      assignedToId: managers[1].id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 7 * 86400000),
    }),
    taskRepo.create({
      title: 'Negotiate new packaging contract',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      department: 'Procurement',
      createdById: adminTwo.id,
      dueDate: new Date(Date.now() + 30 * 86400000),
    }),
    taskRepo.create({
      title: 'Resolve delivery delays',
      description: 'Coordinate with carriers on delayed shipments',
      status: TaskStatus.REVIEW,
      priority: TaskPriority.URGENT,
      department: 'Logistics',
      assignedToId: managers[2].id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 3 * 86400000),
    }),
    taskRepo.create({
      title: 'Generate Q4 demand forecast',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      department: 'Analytics',
      assignedToId: admin.id,
      createdById: admin.id,
    }),
    taskRepo.create({
      title: 'Audit textile suppliers',
      description: 'On-site audit for Fair Trade renewal',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      department: 'Compliance',
      assignedToId: managers[3].id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 21 * 86400000),
    }),
    taskRepo.create({
      title: 'Onboard EcoSteel Works',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      department: 'Procurement',
      assignedToId: managers[1].id,
      createdById: adminTwo.id,
    }),
    taskRepo.create({
      title: 'Renew ISO 14001 certification',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      department: 'Compliance',
      assignedToId: managers[0].id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 45 * 86400000),
    }),
    taskRepo.create({
      title: 'Review BoM costs for solar line',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
      department: 'Engineering',
      assignedToId: managers[4].id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 10 * 86400000),
    }),
    taskRepo.create({
      title: 'Q1 budget approval',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      department: 'Finance',
      assignedToId: admin.id,
      createdById: adminTwo.id,
    }),
  ]);
  console.log('Tasks seeded (10 total)');

  /* ─────────── Notifications ─────────── */
  const notifRepo = ds.getRepository(Notification);
  await notifRepo.save([
    notifRepo.create({
      title: 'Low Stock Alert',
      message:
        'Organic Cotton Fabric (OCF-002) stock below reorder level. Current: 8, Reorder: 30',
      type: NotificationType.LOW_STOCK,
      userId: admin.id,
    }),
    notifRepo.create({
      title: 'Low Stock Alert',
      message:
        'Stainless Steel Bolt M10 (SSB-005) critically low. Current: 5, Reorder: 100',
      type: NotificationType.LOW_STOCK,
      userId: admin.id,
    }),
    notifRepo.create({
      title: 'Low Stock Alert',
      message:
        'Power Cable 14AWG (PC14-015) needs reorder. Current: 9, Reorder: 100',
      type: NotificationType.LOW_STOCK,
      userId: managers[0].id,
    }),
    notifRepo.create({
      title: 'Delivery Delayed',
      message: 'Multiple shipments are showing customs delays this week.',
      type: NotificationType.DELIVERY_DELAY,
      userId: admin.id,
    }),
    notifRepo.create({
      title: 'ESG Compliance Warning',
      message:
        'FastLogistics Hub ESG score below threshold (1.8). Review partnership.',
      type: NotificationType.ESG_NON_COMPLIANCE,
      userId: admin.id,
    }),
    notifRepo.create({
      title: 'ESG Compliance Warning',
      message: 'Premier Plastics ESG score below 2.5 — schedule audit.',
      type: NotificationType.ESG_NON_COMPLIANCE,
      userId: adminTwo.id,
    }),
    notifRepo.create({
      title: 'Task Assigned',
      message: 'You have been assigned: Review supplier ESG compliance reports',
      type: NotificationType.TASK_ASSIGNED,
      userId: managers[0].id,
    }),
    notifRepo.create({
      title: 'Task Assigned',
      message: 'You have been assigned: Audit textile suppliers',
      type: NotificationType.TASK_ASSIGNED,
      userId: managers[3].id,
    }),
    notifRepo.create({
      title: 'Order Update',
      message: `${orders[0]?.orderNumber ?? 'PO-00001'} has been delivered successfully`,
      type: NotificationType.ORDER_STATUS,
      userId: admin.id,
      isRead: true,
    }),
    notifRepo.create({
      title: 'Order Update',
      message: 'New PO submitted to GreenMaterials Co. — pending approval.',
      type: NotificationType.ORDER_STATUS,
      userId: managers[1].id,
    }),
    notifRepo.create({
      title: 'System Update',
      message: 'Demand forecast model retrained with Q3 sales data.',
      type: NotificationType.GENERAL,
      userId: admin.id,
      isRead: true,
    }),
  ]);
  console.log('Notifications seeded (11 total)');

  /* ─────────── Forecasts ─────────── */
  const forecastRepo = ds.getRepository(Forecast);
  const baseDate = new Date();
  for (const product of products.slice(0, 8)) {
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

  // Reference supplierUser so it isn't flagged as unused; it's the dedicated
  // "supplier" role login used for the supplier portal flows.
  void supplierUser;

  console.log('\n=== Seed Complete ===');
  console.log('Login credentials (all share password: password123):');
  console.log('  Admin:    admin@ngim.com');
  console.log('  Admin:    sara.admin@ngim.com');
  console.log('  Manager:  manager@ngim.com');
  console.log('  Manager:  ayesha.manager@ngim.com');
  console.log('  Manager:  bilal.manager@ngim.com');
  console.log('  Manager:  hina.manager@ngim.com');
  console.log('  Manager:  imran.manager@ngim.com');
  console.log('  Supplier: supplier@ngim.com');
  console.log('  Supplier: zara.supplier@ngim.com');
  console.log('  Supplier: omar.supplier@ngim.com');

  await ds.destroy();
}

seed().catch(console.error);
