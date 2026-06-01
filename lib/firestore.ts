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
} from 'firebase/firestore'
import { db } from './firebase'
import { User, Product, Service, Order, ServiceRequest, OrderStatus, ServiceRequestStatus } from '@/types'

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
  await updateDoc(doc(db, 'products', id), data)
}

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, 'products', id))
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
