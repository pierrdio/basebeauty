"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PhotoUploadProps {
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
}

export function PhotoUpload({ value, onChange, maxFiles = 10 }: PhotoUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...value, ...acceptedFiles].slice(0, maxFiles)
    onChange(newFiles)
    
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviews])
  }, [value, onChange, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    },
    maxFiles,
    multiple: true
  })

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index)
    onChange(newFiles)
    
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index])
      setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Отпустите файлы здесь...</p>
            ) : (
              <div>
                <p className="font-medium">Перетащите фотографии сюда или нажмите для выбора</p>
                <p className="text-xs text-gray-500 mt-1">
                  Можно выбрать несколько файлов. Поддерживаются JPG, PNG, GIF, WebP, SVG
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Выбранные фотографии ({value.length}/{maxFiles}):</p>
            {value.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  value.forEach((_, index) => removeFile(index))
                }}
              >
                Очистить все
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {value.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                  {previewUrls[index] ? (
                    <img
                      src={previewUrls[index]}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
