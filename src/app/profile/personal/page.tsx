'use client'

import { useAuth } from '@/hooks/useAuth'
import PersonalData from '@/components/features/profile/PersonalData'

export default function PersonalPage() {
  const { user } = useAuth()
  
  if (!user) return null
  
  return <PersonalData user={user} />
} 