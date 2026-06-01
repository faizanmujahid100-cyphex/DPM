'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { getDesignerServiceRequests, getAvailableServiceRequests, bidOnServiceRequest, updateServiceRequestProgress, updateServiceRequestStatus } from '@/lib/firestore'
import { ServiceRequest, ServiceRequestStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Layers, Save, Zap } from 'lucide-react'
import { toast } from 'sonner'

function RequestCard({ req, isOwn, onUpdate }: { req: ServiceRequest; isOwn: boolean; onUpdate: () => void }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState(req.progress || 0)
  const [saving, setSaving] = useState(false)
  const [bidding, setBidding] = useState(false)

  const handleBid = async () => {
    if (!user) return
    setBidding(true)
    const success = await bidOnServiceRequest(req.id, user.uid, user.name)
    setBidding(false)
    if (success) { toast.success('Service request accepted!'); onUpdate() }
    else { toast.error('Already taken.'); onUpdate() }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateServiceRequestProgress(req.id, progress)
      if (progress === 100) await updateServiceRequestStatus(req.id, 'completed')
      toast.success(progress === 100 ? 'Marked as completed!' : 'Progress updated!')
      onUpdate()
    } catch { toast.error('Failed.') }
    setSaving(false)
  }

  const statusColors: Record<string, string> = {
    submitted: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-bold text-gray-900">{req.serviceName}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status] || 'bg-gray-100 text-gray-600'}`}>{req.status.replace('_', ' ')}</span>
          </div>
          <div className="text-xs text-gray-500">By {req.customerName}</div>
          <p className="text-sm text-gray-600 mt-1">{req.description}</p>
          {req.budget && <div className="text-xs text-violet-600 font-medium mt-1">Budget: PKR {req.budget.toLocaleString()}</div>}
        </div>
      </div>

      {!isOwn && req.status === 'submitted' && (
        <Button onClick={handleBid} disabled={bidding} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Zap className="w-4 h-4" />
          {bidding ? 'Accepting...' : 'Accept Request'}
        </Button>
      )}

      {isOwn && req.status === 'in_progress' && (
        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Progress</Label>
            <span className="text-violet-600 font-bold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <Input type="range" min="0" max="100" step="5" value={progress} onChange={e => setProgress(Number(e.target.value))} className="w-full" />
          <Button onClick={handleSave} disabled={saving} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : progress === 100 ? 'Mark Complete' : 'Update Progress'}
          </Button>
        </div>
      )}

      {req.status === 'completed' && (
        <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 text-center font-medium mt-2">✓ Completed</div>
      )}
    </div>
  )
}

export default function DesignerServicesPage() {
  const { user } = useAuth()
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([])
  const [available, setAvailable] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!user) return
    try {
      const [my, av] = await Promise.all([getDesignerServiceRequests(user.uid), getAvailableServiceRequests()])
      setMyRequests(my)
      setAvailable(av)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
      <Tabs defaultValue="available">
        <TabsList>
          <TabsTrigger value="available">Available ({available.length})</TabsTrigger>
          <TabsTrigger value="mine">My Requests ({myRequests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="available" className="mt-4 space-y-3">
          {available.map(req => <RequestCard key={req.id} req={req} isOwn={false} onUpdate={load} />)}
          {available.length === 0 && <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">No available requests.</div>}
        </TabsContent>
        <TabsContent value="mine" className="mt-4 space-y-3">
          {myRequests.map(req => <RequestCard key={req.id} req={req} isOwn={true} onUpdate={load} />)}
          {myRequests.length === 0 && <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">No assigned requests yet.</div>}
        </TabsContent>
      </Tabs>
    </div>
  )
}
