import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { User, Category, Product, Service, Order, ServiceRequest, OrderFormField, OrderStatus, ServiceRequestStatus, TeamMember, ContactInfo, PaymentMethod, PaymentSettings, PaymentRecord, PaymentStatus } from '@/types'

// ── Order Form Fields ──────────────────────────────────────────────────────────

const DEFAULT_FIELDS: Omit<OrderFormField, 'id'>[] = [
  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Enter your full name', required: true, active: true, isSystem: true, minLength: 2, maxLength: 60, autoFillKey: 'name', order: 1 },
  { label: "Father's Name", key: 'fatherName', type: 'text', placeholder: "Enter father's name", required: false, active: true, isSystem: true, minLength: 2, maxLength: 60, autoFillKey: 'fatherName', order: 2 },
  { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '03xxxxxxxxx (11 digits)', required: true, active: true, isSystem: true, minLength: 11, maxLength: 11, autoFillKey: 'phone', order: 3 },
  { label: 'WhatsApp Number', key: 'whatsapp', type: 'tel', placeholder: '03xxxxxxxxx (11 digits)', required: false, active: true, isSystem: true, minLength: 11, maxLength: 11, autoFillKey: 'whatsapp', order: 4 },
  { label: 'Email Address', key: 'email', type: 'email', placeholder: 'your@email.com', required: true, active: true, isSystem: true, autoFillKey: 'email', order: 5 },
  { label: 'Delivery Address', key: 'address', type: 'textarea', placeholder: 'Full delivery address with city', required: true, active: true, isSystem: true, minLength: 10, autoFillKey: 'address', order: 6 },
  { label: 'Order Notes', key: 'notes', type: 'textarea', placeholder: 'Any special instructions...', required: false, active: true, isSystem: false, order: 7 },
]

export const getOrderFormFields = async (): Promise<OrderFormField[]> => {
  const snap = await getDocs(query(collection(db, 'orderFormFields'), orderBy('order', 'asc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as OrderFormField))
}

export const seedDefaultOrderFormFields = async (): Promise<void> => {
  const existing = await getOrderFormFields()
  if (existing.length > 0) return
  for (const field of DEFAULT_FIELDS) {
    await addDoc(collection(db, 'orderFormFields'), field)
  }
}

export const saveOrderFormField = async (data: Omit<OrderFormField, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'orderFormFields'), data)
  return ref.id
}

export const updateOrderFormField = async (id: string, data: Partial<OrderFormField>): Promise<void> => {
  await updateDoc(doc(db, 'orderFormFields', id), data)
}

export const deleteOrderFormField = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'orderFormFields', id))
}

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('createdAt', 'asc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category))
}

export const addCategory = async (data: Omit<Category, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp() })
}

export const updateCategory = async (id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
  await updateDoc(doc(db, 'categories', id), data)
}

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(db, 'categories', id))
}

// Contact Info

export const DEFAULT_CONTACT: ContactInfo = {
  phone: '+92 300 0000000',
  phoneLink: '',
  whatsapp: '+92 300 0000000',
  whatsappLink: '',
  email: 'info@dpmprinting.com',
  address: 'DPM Printing Center\nMain Branch, Pakistan',
  mapLink: '',
  hours: 'Mon–Sat: 9AM – 9PM\nSunday: 10AM – 6PM',
  facebookUrl: '',
  instagramUrl: '',
}

export const getContactInfo = async (): Promise<ContactInfo> => {
  const snap = await getDoc(doc(db, 'settings', 'contact'))
  return snap.exists() ? { ...DEFAULT_CONTACT, ...snap.data() } as ContactInfo : DEFAULT_CONTACT
}

export const updateContactInfo = async (data: Partial<ContactInfo>) => {
  await setDoc(doc(db, 'settings', 'contact'), data, { merge: true })
}

// Payment Methods

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const snap = await getDocs(query(collection(db, 'paymentMethods'), orderBy('createdAt', 'asc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentMethod))
}

export const getActivePaymentMethods = async (): Promise<PaymentMethod[]> => {
  return (await getPaymentMethods()).filter(m => m.active)
}

export const addPaymentMethod = async (data: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'paymentMethods'), { ...data, createdAt: serverTimestamp() })
}

export const updatePaymentMethod = async (id: string, data: Partial<Omit<PaymentMethod, 'id' | 'createdAt'>>) => {
  await setDoc(doc(db, 'paymentMethods', id), data, { merge: true })
}

export const deletePaymentMethod = async (id: string) => {
  await deleteDoc(doc(db, 'paymentMethods', id))
}

// Payment Settings (where customers send payment screenshots)

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  whatsapp: '',
  email: '',
  instructions: 'After paying, send a screenshot of your payment along with your Payment ID so we can verify it.',
}

export const getPaymentSettings = async (): Promise<PaymentSettings> => {
  const snap = await getDoc(doc(db, 'settings', 'payment'))
  return snap.exists() ? { ...DEFAULT_PAYMENT_SETTINGS, ...snap.data() } as PaymentSettings : DEFAULT_PAYMENT_SETTINGS
}

export const updatePaymentSettings = async (data: Partial<PaymentSettings>) => {
  await setDoc(doc(db, 'settings', 'payment'), data, { merge: true })
}

// Order payments — records a (possibly partial) payment and keeps
// amountPaid / paymentStatus consistent with the order total.
export const addOrderPayment = async (orderId: string, payment: { amount: number; note?: string; addedBy: string; addedByName: string }) => {
  const ref = doc(db, 'orders', orderId)
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref)
    if (!snap.exists()) throw new Error('Order not found')
    const order = snap.data() as Order
    const record: PaymentRecord = {
      amount: payment.amount,
      addedBy: payment.addedBy,
      addedByName: payment.addedByName,
      date: Timestamp.now(),
      ...(payment.note ? { note: payment.note } : {}),
    }
    const payments = [...(order.payments ?? []), record]
    const amountPaid = (order.amountPaid ?? 0) + payment.amount
    const paymentStatus: PaymentStatus = amountPaid >= order.total ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid'
    transaction.update(ref, { payments, amountPaid, paymentStatus, updatedAt: serverTimestamp() })
  })
}

// Team Members

const DEFAULT_TEAM: Omit<TeamMember, 'id' | 'createdAt'>[] = [
  { name: 'Muhammad Ali', role: 'Founder & CEO', initials: 'MA', color: 'from-violet-500 to-purple-600', order: 1 },
  { name: 'Hassan Raza', role: 'Lead Designer', initials: 'HR', color: 'from-orange-500 to-pink-500', order: 2 },
  { name: 'Ayesha Khan', role: 'Production Manager', initials: 'AK', color: 'from-green-500 to-teal-600', order: 3 },
  { name: 'Zain Ahmed', role: 'Customer Relations', initials: 'ZA', color: 'from-blue-500 to-indigo-600', order: 4 },
]

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const snap = await getDocs(query(collection(db, 'teamMembers'), orderBy('order', 'asc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember))
}

export const seedDefaultTeamMembers = async (): Promise<void> => {
  const existing = await getTeamMembers()
  if (existing.length > 0) return
  for (const member of DEFAULT_TEAM) {
    await addDoc(collection(db, 'teamMembers'), { ...member, createdAt: serverTimestamp() })
  }
}

export const addTeamMember = async (data: Omit<TeamMember, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'teamMembers'), { ...data, createdAt: serverTimestamp() })
}

export const updateTeamMember = async (id: string, data: Partial<Omit<TeamMember, 'id' | 'createdAt'>>) => {
  await updateDoc(doc(db, 'teamMembers', id), data)
}

export const deleteTeamMember = async (id: string) => {
  await deleteDoc(doc(db, 'teamMembers', id))
}

// Users
export const createUser = async (uid: string, data: Omit<User, 'uid' | 'createdAt'>) => {
  await setDoc(doc(db, 'users', uid), { ...data, uid, createdAt: serverTimestamp() })
}

export const getUser = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as User) : null
}

export const updateUser = async (uid: string, data: Partial<User>) => {
  await updateDoc(doc(db, 'users', uid), data)
}

export const getAllDesigners = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'), where('role', '==', 'designer'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as User)
}

export const getAllUsers = async (): Promise<User[]> => {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => d.data() as User)
}

// Products
export const getProducts = async (): Promise<Product[]> => {
  const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
}

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const q = query(collection(db, 'products'), where('featured', '==', true), where('inStock', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
}

export const addProduct = async (data: Omit<Product, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() })
}

export const updateProduct = async (id: string, data: Partial<Product>) => {
  // setDoc+merge is more reliable than updateDoc for adding new fields (like variants)
  // to documents that were created before those fields existed.
  await setDoc(doc(db, 'products', id), data, { merge: true })
}

export const getProductById = async (id: string): Promise<Product | null> => {
  const snap = await getDoc(doc(db, 'products', id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null
}

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, 'products', id))
}

export const batchUpdateProducts = async (updates: { id: string; data: Partial<Product> }[]) => {
  await Promise.all(updates.map(({ id, data }) => updateProduct(id, data)))
}

// Services
export const getServices = async (): Promise<Service[]> => {
  const q = query(collection(db, 'services'), where('active', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Service))
}

export const getAllServices = async (): Promise<Service[]> => {
  const snap = await getDocs(query(collection(db, 'services'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Service))
}

export const addService = async (data: Omit<Service, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'services'), { ...data, createdAt: serverTimestamp() })
}

export const updateService = async (id: string, data: Partial<Service>) => {
  await updateDoc(doc(db, 'services', id), data)
}

export const deleteService = async (id: string) => {
  await deleteDoc(doc(db, 'services', id))
}

// Orders
export const createOrder = async (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'orders'), {
    ...data,
    status: 'awaiting_bid' as OrderStatus,
    paymentStatus: 'unpaid' as PaymentStatus,
    amountPaid: 0,
    payments: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export const getOrder = async (id: string): Promise<Order | null> => {
  const snap = await getDoc(doc(db, 'orders', id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null
}

export const getOrdersByCustomer = async (customerId: string): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), where('customerId', '==', customerId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
}

export const getAllOrders = async (): Promise<Order[]> => {
  const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
}

export const getAvailableOrders = async (): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), where('status', '==', 'awaiting_bid'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
}

export const getDesignerOrders = async (designerId: string): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), where('designerId', '==', designerId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
}

// Atomic first-come-first-served bid
export const bidOnOrder = async (orderId: string, designerId: string, designerName: string): Promise<boolean> => {
  const orderRef = doc(db, 'orders', orderId)
  try {
    let success = false
    await runTransaction(db, async (transaction) => {
      const orderDoc = await transaction.get(orderRef)
      if (!orderDoc.exists()) throw new Error('Order not found')
      const order = orderDoc.data() as Order
      if (order.status !== 'awaiting_bid') { success = false; return }
      transaction.update(orderRef, {
        status: 'in_progress',
        designerId,
        designerName,
        designerProgress: 0,
        updatedAt: serverTimestamp(),
      })
      success = true
    })
    return success
  } catch {
    return false
  }
}

export const updateOrderProgress = async (orderId: string, progress: number) => {
  await updateDoc(doc(db, 'orders', orderId), { designerProgress: progress, updatedAt: serverTimestamp() })
}

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: serverTimestamp() })
}

export const reassignOrder = async (orderId: string, designerId: string, designerName: string) => {
  await updateDoc(doc(db, 'orders', orderId), {
    designerId, designerName, designerProgress: 0, status: 'in_progress', updatedAt: serverTimestamp(),
  })
}

// Service Requests
export const createServiceRequest = async (data: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'serviceRequests'), {
    ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  return ref.id
}

export const getAllServiceRequests = async (): Promise<ServiceRequest[]> => {
  const snap = await getDocs(query(collection(db, 'serviceRequests'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceRequest))
}

export const getCustomerServiceRequests = async (customerId: string): Promise<ServiceRequest[]> => {
  const q = query(collection(db, 'serviceRequests'), where('customerId', '==', customerId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceRequest))
}

export const getAvailableServiceRequests = async (): Promise<ServiceRequest[]> => {
  const q = query(collection(db, 'serviceRequests'), where('status', '==', 'submitted'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceRequest))
}

export const getDesignerServiceRequests = async (designerId: string): Promise<ServiceRequest[]> => {
  const q = query(collection(db, 'serviceRequests'), where('designerId', '==', designerId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceRequest))
}

export const bidOnServiceRequest = async (requestId: string, designerId: string, designerName: string): Promise<boolean> => {
  const ref = doc(db, 'serviceRequests', requestId)
  try {
    let success = false
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref)
      if (!snap.exists()) throw new Error('Not found')
      const req = snap.data() as ServiceRequest
      if (req.status !== 'submitted') { success = false; return }
      transaction.update(ref, {
        status: 'in_progress' as ServiceRequestStatus,
        designerId, designerName, progress: 0, updatedAt: serverTimestamp(),
      })
      success = true
    })
    return success
  } catch {
    return false
  }
}

export const updateServiceRequestProgress = async (id: string, progress: number) => {
  await updateDoc(doc(db, 'serviceRequests', id), { progress, updatedAt: serverTimestamp() })
}

export const updateServiceRequestStatus = async (id: string, status: ServiceRequestStatus) => {
  await updateDoc(doc(db, 'serviceRequests', id), { status, updatedAt: serverTimestamp() })
}

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  return onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)))
  })
}

export const subscribeToAvailableOrders = (callback: (orders: Order[]) => void) => {
  return onSnapshot(query(collection(db, 'orders'), where('status', '==', 'awaiting_bid')), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)))
  })
}

export const subscribeToDesignerOrders = (designerId: string, callback: (orders: Order[]) => void) => {
  return onSnapshot(query(collection(db, 'orders'), where('designerId', '==', designerId)), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)))
  })
}
