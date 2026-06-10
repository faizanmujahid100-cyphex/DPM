'use client'

import { useEffect, useState } from 'react'
import { getTeamMembers } from '@/lib/firestore'
import { TeamMember } from '@/types'
import CloudImg from '@/components/ui/CloudImg'

export default function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeamMembers()
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || members.length === 0) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {members.map(({ id, name, role, initials, color, imageUrl }) => (
        <div key={id} className="text-center group">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-xl text-white text-2xl font-bold overflow-hidden group-hover:scale-110 transition-transform`}>
            {imageUrl ? (
              <CloudImg src={imageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="font-bold text-gray-900">{name}</div>
          <div className="text-gray-500 text-sm">{role}</div>
        </div>
      ))}
    </div>
  )
}
