import Header from '@/components/layout/Header'
import CategoryCard from '@/components/features/CategoryCard'

export default function Home() {
  const categories = [
    {
      title: 'Школы',
      description: 'Изучайте образовательные учреждения',
      color: 'bg-[#FFB156]',
      icon: 'https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/academic-cap.svg',
      href: '/schools'
    },
    {
      title: 'Сады',
      description: 'Узнайте о природе и растениях',
      color: 'bg-[#72DFC5]',
      icon: 'https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/sparkles.svg',
      href: '/gardens'
    },
    {
      title: 'Спорт',
      description: 'Физическая активность и игры',
      color: 'bg-[#8B9FFF]',
      icon: 'https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/fire.svg',
      href: '/sports'
    },
    {
      title: 'Развитие',
      description: 'Отслеживайте свой прогресс',
      color: 'bg-[#FF8FA3]',
      icon: 'https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/chart-bar.svg',
      href: '/development'
    }
  ]

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
