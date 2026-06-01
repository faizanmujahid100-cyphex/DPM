import { Users, Package, Star, Clock } from 'lucide-react'

const stats = [
  { icon: Users, value: '5,000+', label: 'Happy Customers', color: 'text-violet-600', bg: 'bg-violet-50' },
  { icon: Package, value: '50,000+', label: 'Orders Completed', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: Star, value: '4.9/5', label: 'Customer Rating', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { icon: Clock, value: '48hrs', label: 'Avg Delivery Time', color: 'text-green-500', bg: 'bg-green-50' },
]

export default function StatsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, value, label, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`inline-flex w-12 h-12 rounded-xl items-center justify-center ${bg} mb-3 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-1">{value}</div>
              <div className="text-sm text-gray-500 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
