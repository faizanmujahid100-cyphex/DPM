'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { getCustomerServiceRequests } from '@/lib/firestore'
import { ServiceRequest } from '@/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Layers, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  submitted: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function CustomerServicesPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getCustomerServiceRequests(user.uid).then(setRequests).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Service Requests</h1>
        <Link href="/services">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            New Request <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {requests.map(req => (
          <div key={req.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{req.serviceName}</div>
                  {req.designerName && <div className="text-xs text-gray-500">Designer: {req.designerName}</div>}
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[req.status]}`}>
                {req.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-3">{req.description}</p>

            {req.budget && <div className="text-xs text-violet-600 font-medium mb-3">Budget: PKR {req.budget.toLocaleString()}</div>}

            {req.status === 'in_progress' && req.progress !== undefined && (
              <div className="p-3 bg-purple-50 rounded-xl">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-purple-700 font-medium">Designer working...</span>
                  <span className="text-purple-700 font-bold">{req.progress}%</span>
                </div>
                <Progress value={req.progress} className="h-2" />
              </div>
            )}

            {req.status === 'completed' && (
              <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 font-medium text-center">✓ Completed!</div>
            )}
          </div>
        ))}

        {requests.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 font-semibold mb-2">No service requests yet</h3>
            <p className="text-gray-400 text-sm mb-4">Browse our services and submit your first request!</p>
            <Link href="/services">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">Browse Services</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
