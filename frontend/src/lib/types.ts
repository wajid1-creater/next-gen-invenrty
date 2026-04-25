// API domain types mirror the backend entities.
// Keep in sync with backend/src/**/entities/*.entity.ts.

export type UserRole = 'admin' | 'manager' | 'supplier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * /auth/login and /auth/register response.
 *
 * `token` is included for backwards-compat (CLI tools that still use the
 * Authorization header) but the browser auth flow uses the httpOnly cookie set
 * by the same response. The frontend should not store this value.
 */
export interface AuthResponse {
  user: User;
  token: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  category: string | null;
  /** Decimals come over the wire as strings from pg. Coerce when displaying. */
  unitPrice: string | number;
  currentStock: number;
  reorderLevel: number;
  unit: string | null;
  bomItems?: BomItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BomItem {
  id: string;
  productId: string;
  supplierId: string;
  supplier?: Supplier;
  quantity: number;
}

export type SupplierStatus = 'active' | 'inactive' | 'suspended';

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: SupplierStatus;
  esgScore: string | number;
  certifications: string | null;
  purchaseOrders?: PurchaseOrder[];
  createdAt: string;
  updatedAt: string;
}

export type POStatus = 'draft' | 'submitted' | 'approved' | 'shipped' | 'delivered' | 'cancelled';

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier?: Supplier;
  items: PurchaseOrderItem[];
  totalAmount: string | number;
  status: POStatus;
  expectedDeliveryDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'returned';

export interface Delivery {
  id: string;
  trackingNumber: string;
  purchaseOrderId: string;
  purchaseOrder?: PurchaseOrder;
  status: DeliveryStatus;
  estimatedArrival: string | null;
  actualArrival: string | null;
  carrier: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  department: string | null;
  assignedToId: string | null;
  assignedTo?: User | null;
  createdById: string;
  createdBy?: User;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'low_stock'
  | 'delivery_delay'
  | 'esg_non_compliance'
  | 'task_assigned'
  | 'order_status'
  | 'general';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export interface Forecast {
  id: string;
  productId: string;
  product?: Product;
  forecastDate: string;
  predictedDemand: number;
  actualDemand: number | null;
  confidence: string | number | null;
  model: string | null;
  createdAt: string;
}

export interface ShortageAlert {
  product: Product;
  currentStock: number;
  predictedDemand3Months: number;
  shortageAmount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ----- Dashboard aggregations -----

export interface DashboardOverview {
  totalProducts: number;
  totalSuppliers: number;
  totalOrders: number;
  totalDeliveries: number;
  totalTasks: number;
  lowStockProducts: number;
  pendingOrders: number;
  delayedDeliveries: number;
  completedTasks: number;
  taskCompletionRate: number;
  totalOrderValue: number;
  avgEsgScore: number;
}

/** Raw aggregation rows from TypeORM `getRawMany` — counts arrive as strings. */
export interface OrdersByStatusRow {
  status: POStatus;
  count: string;
}

export interface DeliveryPerformanceRow {
  status: DeliveryStatus;
  count: string;
}

export interface TopSupplierRow {
  id: string;
  name: string;
  esgScore: string;
  orderCount: string;
  totalValue: string;
}

export interface MonthlySpendRow {
  month: string;
  total: string;
}

/**
 * Standard list-endpoint response shape (matches backend `Page<T>`).
 *
 * Heavy list endpoints (products, suppliers, purchase-orders) return this;
 * specialised endpoints (dashboard aggregations, BoM, low-stock) still return
 * raw arrays.
 */
export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Shape of the error body Nest returns from validation / exception filters. */
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}
