'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface SchoolGalleryProps {
  images: string[]
}

// Моковые фотографии
const mockImages = [
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7',
  'https://images.unsplash.com/photo-1444723121867-7a241cacace9',
  'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45',
  'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d'
]

export default function SchoolGallery({ images }: SchoolGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Используем переданные изображения или моковые, если галерея пустая
  const galleryImages = images?.length > 0 ? images : mockImages

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Фотографии школы</h2>
      
      <div className="relative">
        <div className="grid grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="aspect-video relative rounded-lg overflow-hidden cursor-pointer"
              onClick={() => {
                setCurrentIndex(index)
                setIsModalOpen(true)
              }}
            >
              <Image
                src={image}
                alt={`Фото ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
          
          <button
            onClick={handlePrevious}
            className="absolute left-4 text-white hover:text-gray-300"
          >
            <ChevronLeft size={36} />
          </button>
          
          <div className="relative w-full max-w-4xl aspect-video">
            <Image
              src={galleryImages[currentIndex]}
              alt={`Фото ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>
          
          <button
            onClick={handleNext}
            className="absolute right-4 text-white hover:text-gray-300"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </div>
  )
} 