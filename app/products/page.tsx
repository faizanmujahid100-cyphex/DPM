import { Suspense } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import ProductsClient from './ProductsClient'
import { Package } from 'lucide-react'

function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading products...</p>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingFallback />}>
        <ProductsClient />
      </Suspense>
    </MainLayout>
  )
}
