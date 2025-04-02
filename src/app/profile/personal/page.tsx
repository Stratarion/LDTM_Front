'use client'

import { useAuth } from '@/shared/lib/hooks/useAuth'
import PersonalData from '@/features/profile/PersonalData'

export default function PersonalPage() {
  const { user } = useAuth()
  
  if (!user) return null
  
  return <PersonalData user={user} />
} 