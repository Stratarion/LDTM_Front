'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Sport } from '@/services/sports.service'

interface SportGalleryProps {
  sport?: Sport
}

export default function SportGallery({ sport }: SportGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Проверяем наличие школы
  if (!sport) {
    return null
  }

  // Собираем все фото школы в один массив
  const photos = sport.photos || []
  if (sport.mainPhoto && !photos.find(p => p.id === sport.mainPhoto?.id)) {
    photos.unshift(sport.mainPhoto)
  }
  if (photos.length === 0) {
    return null
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Фотографии</h2>
      
      <div className="relative">
        <div className="grid grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="aspect-video relative rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => {
                setCurrentIndex(index)
                setIsModalOpen(true)
              }}
            >
              <Image
                src={photo.url}
                alt={`Фото ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
              {photo.description === 'main' && (
                <div className="absolute top-2 left-2 bg-yellow-400/80 text-white px-2 py-1 rounded text-xs">
                  Главное фото
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsModalOpen(false)
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrevious()
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={36} />
          </button>
          
          <div className="relative w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <Image
              src={photos[currentIndex].url}
              alt={`Фото ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
            {photos[currentIndex].description === 'main' && (
              <div className="absolute top-4 left-4 bg-yellow-400/80 text-white px-3 py-1.5 rounded">
                Главное фото
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight size={36} />
          </button>

          {/* Индикатор текущего фото */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  )
} 