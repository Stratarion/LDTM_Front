'use client'

import { usePathname } from 'next/navigation'
import Header from '@/widgets/Header'
import { SportList } from '@/features/sport/sport-list'
import { ListHeader } from '@/shared/ui/ListHeader'
import { sportTitles } from './constants'
export const SportListPage = () => {
  const pathname = usePathname()
  return (
    <main className="min-h-screen bg-gray-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ListHeader 
          header={sportTitles.header}
          description={sportTitles.description}
        />
        <SportList key={pathname} />
      </div>
    </main>
  )
}
