import Header from '@/widgets/Header'
import CategoryCard from '@/features/CategoryCard/CategoryCard'
import { categories } from './constants'
import { HelloBlock } from './components/HelloBlock'

export const HomePage = () => {

  return (
    <main className="min-h-screen bg-gray-200">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <HelloBlock />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.title}
              {...category}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
