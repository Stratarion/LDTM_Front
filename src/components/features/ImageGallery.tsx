'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageGalleryProps {
  images: string[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const openModal = (index: number) => setSelectedImage(index)
  const closeModal = () => setSelectedImage(null)

  const goToPrevious = () => {
    if (selectedImage === null) return
    setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)
  }

  const goToNext = () => {
    if (selectedImage === null) return
    setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1)
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => openModal(index)}
            className="relative aspect-[4/3] rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
          >
            <Image
              src={image}
              alt={`Фото ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Модальное окно */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={closeModal}
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={closeModal}
                className="p-2 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              className="absolute left-4 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <div 
              className="relative w-full max-w-4xl aspect-[4/3] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedImage]}
                alt={`Фото ${selectedImage + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-4 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 