"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Photo {
  fileName: string
  fileUrl: string
}

interface PhotoPreviewProps {
  photos: Photo[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

export function PhotoPreview({ photos, initialIndex = 0, isOpen, onClose }: PhotoPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Card className="max-w-4xl max-h-[90vh] w-full bg-white dark:bg-gray-900">
        <CardContent className="p-0 relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Previous button */}
          {hasPrevious && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Next button */}
          {hasNext && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Image */}
          <div className="flex items-center justify-center p-4">
            <img
              src={currentPhoto.fileUrl}
              alt={currentPhoto.fileName}
              className="max-w-full max-h-[70vh] object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Photo info */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentPhoto.fileName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentIndex + 1} из {photos.length}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(currentPhoto.fileUrl, '_blank')
                  }}
                >
                  Открыть в новой вкладке
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
