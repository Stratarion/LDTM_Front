'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, MapPin, Phone, Mail, Star, Users } from 'lucide-react'
import Image from 'next/image'
import Header from '@/widgets/Header'
import { Garden, GardensService } from '@/services/gardens.service'
import ImageGallery from '@/features/ImageGallery'
import GardenReviews from '@/features/garden/GardenReviews'

export default function GardenPage() {
  const { id } = useParams()
  const [garden, setGarden] = useState<Garden | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGarden = async () => {
      try {
        const data = await GardensService.getGardenById(id as string)
        setGarden(data)
      } catch (err) {
        setError('Не удалось загрузить информацию о детском саде')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadGarden()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-200">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !garden) {
    return (
      <div className="min-h-screen bg-gray-200">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || 'Детский сад не найден'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Основная информация */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Аватар */}
            <div className="w-full md:w-1/3">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={garden.avatar || "https://picsum.photos/400/300"}
                  alt={garden.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Информация */}
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{garden.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  garden.school_type === 'state' 
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-purple-50 text-purple-600'
                }`}>
                  {garden.school_type === 'state' ? 'Государственный' : 'Частный'}
                </span>
              </div>

              <div className="space-y-4">
                {/* Рейтинг и количество детей */}
                <div className="flex items-center gap-6">
                  {garden.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      <div>
                        <span className="font-medium text-lg">{garden.rating.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm ml-1">
                          ({garden.reviewCount} {garden.reviewCount === 1 ? 'отзыв' : 'отзывов'})
                        </span>
                      </div>
                    </div>
                  )}
                  {garden.max_count && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5" />
                      <span>до {garden.max_count} детей</span>
                    </div>
                  )}
                </div>

                {/* Контактная информация */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{garden.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>{garden.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span>{garden.email}</span>
                  </div>
                </div>

                {/* Стоимость */}
                {garden.cost_info && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-gray-600">Стоимость в месяц</div>
                    <div className="text-2xl font-medium text-gray-900">
                      ~{garden.cost_info.toLocaleString()} ₽
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Описание */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">О детском саде</h2>
          <div className="prose max-w-none">
            {garden.description}
          </div>
        </div>

        {/* Особенности */}
        {garden.features && garden.features.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Особенности</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {garden.features.map(feature => (
                <div key={feature.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-[#5CD2C6]/10 flex items-center justify-center">
                    <Image
                      src={feature.icon}
                      alt={feature.name}
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.name}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Галерея */}
        {garden.gallery && garden.gallery.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Фотографии</h2>
            <ImageGallery images={garden.gallery} />
          </div>
        )}

        {/* Отзывы */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Отзывы</h2>
          <GardenReviews 
            organizationId={garden.id}
          />
        </div>
      </div>
    </div>
  )
} 