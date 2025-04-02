import Header from '@/widgets/Header'
import CategoryCard from '@/features/CategoryCard'
import { categories } from './constants'

export const HomePage = () => {

  return (
    <main className="min-h-screen bg-gray-200">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">С возвращением, Исследователь! 🚀</h1>
          <p className="text-gray-600 text-lg">Готовы продолжить свое обучение?</p>
        </section>

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
