"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface Photo {
  fileName: string
  fileUrl: string
}

interface SimplePhotoPreviewProps {
  photos: Photo[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

export function SimplePhotoPreview({ photos, initialIndex = 0, isOpen, onClose }: SimplePhotoPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    } else {
      setIsAnimating(false)
    }
  }, [isOpen])

  if (!isOpen || photos.length === 0) return null

  const currentPhoto = photos[currentIndex]
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  const goToPrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && hasPrevious) goToPrevious()
    if (e.key === 'ArrowRight' && hasNext) goToNext()
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(onClose, 300) // Задержка для анимации закрытия
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-all duration-300 ease-out font-onest ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Кнопка закрытия */}
      123213
      <button
        className={`absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-all duration-300 transform ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
        style={{ transitionDelay: isAnimating ? '200ms' : '0ms' }}
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
        }}
      >
        <X className="h-6 w-6" />
      </button>

      {/* Кнопка назад */}
      {hasPrevious && (
        <button
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-all duration-300 transform ${
            isAnimating ? 'scale-100 opacity-100 translate-x-0' : 'scale-75 opacity-0 -translate-x-4'
          }`}
          style={{ transitionDelay: isAnimating ? '150ms' : '0ms' }}
          onClick={(e) => {
            e.stopPropagation()
            goToPrevious()
          }}
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {/* Кнопка вперед */}
      {hasNext && (
        <button
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-all duration-300 transform ${
            isAnimating ? 'scale-100 opacity-100 translate-x-0' : 'scale-75 opacity-0 translate-x-4'
          }`}
          style={{ transitionDelay: isAnimating ? '150ms' : '0ms' }}
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Фото */}
      <img
        src={currentPhoto.fileUrl}
        alt={currentPhoto.fileName}
        className={`max-w-full max-h-[80vh] object-contain transition-all duration-500 ease-out transform ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Номер изображения */}
      <div 
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full transition-all duration-300 transform ${
          isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: isAnimating ? '250ms' : '0ms' }}
      >
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  )
}
