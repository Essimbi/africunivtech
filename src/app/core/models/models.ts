export type UserRole = 'client' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  company?: string | null;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  position: number;
  productCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceDeltaTtc: number;
  stock: number;
  isDefault: boolean;
}

export type Availability = 'in_stock' | 'on_order' | 'incoming';

export interface Product {
  id: string;
  categoryId: string;
  category?: Category;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  shortDescription?: string;
  description?: string;
  specs: Record<string, string>;
  highlights: string[];
  priceHt: number;
  priceTtc: number;
  compareAtPriceTtc?: number | null;
  stock: number;
  stockAlertThreshold: number;
  warrantyMonths: number;
  availability: Availability;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  ratingAvg: number;
  ratingCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface PagedResult<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CartLine {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPriceTtc: number;
  lineTotalTtc: number;
  product: { id: string; name: string; slug: string; sku: string; stock: number; image: string | null };
  variant: { id: string; name: string; stock: number } | null;
}

export interface CartTotals {
  subtotalHt: number;
  vatAmount: number;
  vatRate: number;
  itemsTotalTtc: number;
  shippingFee: number;
  totalTtc: number;
}

export interface Cart {
  id: string;
  items: CartLine[];
  totals: CartTotals;
}

export interface Address {
  id: string;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  country: string;
  isDefault: boolean;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
export type PaymentMethod = 'orange_money' | 'mtn_momo' | 'card' | 'bank_transfer';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName?: string | null;
  sku: string;
  unitPriceTtc: number;
  quantity: number;
  lineTotalTtc: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: OrderStatus;
  comment?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: { id: string; firstName: string; lastName: string; email: string; company?: string; phone?: string };
  status: OrderStatus;
  subtotalHt: number;
  vatAmount: number;
  vatRate: number;
  shippingFee: number;
  totalTtc: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  shippingAddress: Record<string, string>;
  billingAddress: Record<string, string>;
  notes?: string | null;
  items: OrderItem[];
  statusHistory?: OrderStatusHistoryEntry[];
  invoice?: { id: string; invoiceNumber: string } | null;
  createdAt: string;
}

export interface DashboardKpis {
  revenueThisMonth: number;
  pendingOrders: number;
  criticalStock: number;
  newCustomersThisMonth: number;
  statusBreakdown: { status: OrderStatus; count: number }[];
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  isActive: boolean;
  createdAt: string;
}
