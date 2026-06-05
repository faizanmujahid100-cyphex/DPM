import { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'designer' | 'customer'

export interface User {
  uid: string
  email: string
  name: string
  role: UserRole
  phone?: string
  fatherName?: string
  whatsapp?: string
  address?: string
  photoURL?: string
  profileComplete?: boolean
  createdAt: Timestamp
}

export interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string
  color: string
  createdAt: Timestamp
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  description: string
  imageUrl: string
  images?: string[]
  inStock: boolean
  featured: boolean
  variants?: ProductVariant[]
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

export interface ProductVariant {
  label: string
  price: number
  color?: string   // hex string, e.g. "#ff0000" — only for type 'color'
  type: 'color' | 'package'
}

export interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
  imageUrl: string
  category: string
  variantLabel?: string
}

export type OrderStatus = 'pending' | 'awaiting_bid' | 'in_progress' | 'quality_check' | 'completed' | 'cancelled'

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  items: CartItem[]
  total: number
  status: OrderStatus
  formData: Record<string, string>
  designerId?: string
  designerName?: string
  designerProgress?: number
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type FieldType = 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select'

export interface OrderFormField {
  id: string
  label: string
  key: string
  type: FieldType
  placeholder: string
  required: boolean
  active: boolean
  isSystem: boolean
  minLength?: number
  maxLength?: number
  options?: string[]
  autoFillKey?: string
  order: number
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
