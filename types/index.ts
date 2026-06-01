import { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'designer' | 'customer'

export interface User {
  uid: string
  email: string
  name: string
  role: UserRole
  phone?: string
  createdAt: Timestamp
}

export type ProductCategory = 'photo-frame' | 'mug' | 'shirt' | 'banner' | 'business-card' | 'sticker' | 'custom'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  price: number
  description: string
  imageUrl: string
  inStock: boolean
  featured: boolean
  createdAt: Timestamp
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  turnaround: string
  imageUrl: string
  active: boolean
  createdAt: Timestamp
}

export interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
  imageUrl: string
  category: string
}

export type OrderStatus = 'pending' | 'awaiting_bid' | 'in_progress' | 'quality_check' | 'completed' | 'cancelled'

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: CartItem[]
  total: number
  status: OrderStatus
  designerId?: string
  designerName?: string
  designerProgress?: number
  notes?: string
  shippingAddress?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type ServiceRequestStatus = 'submitted' | 'reviewing' | 'in_progress' | 'completed' | 'cancelled'

export interface ServiceRequest {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  serviceId: string
  serviceName: string
  description: string
  budget?: number
  status: ServiceRequestStatus
  designerId?: string
  designerName?: string
  progress?: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
