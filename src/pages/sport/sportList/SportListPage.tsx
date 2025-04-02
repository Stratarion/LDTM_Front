'use client'

import { usePathname } from 'next/navigation'
import Header from '@/widgets/Header'
import { SportsList } from '@/features/sport/sport-list'
export const SportListPage = () => {
  const pathname = usePathname()
  return (
    <main className="min-h-screen bg-gray-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Спортивные секции</h1>
            <p className="text-gray-600 mt-2">
              Найдите подходящую спортивную секцию для вашего ребенка
            </p>
          </div>
        </div>

        <SportsList key={pathname} />
      </div>
    </main>
  )
}
