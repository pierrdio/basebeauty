"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhotoUpload } from "@/components/ui/photo-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Pencil } from "lucide-react"

interface Video {
  id: number
  title: string
  description: string
  videoUrl: string
  createdAt: string
  updatedAt: string
}

interface EditVideoDialogProps {
  video: Video | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditVideoDialog({ video, isOpen, onClose, onSave }: EditVideoDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videos: [] as File[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        description: video.description,
        videos: []
      })
    } else {
      setFormData({
        title: "",
        description: "",
        videos: []
      })
    }
  }, [video])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Пожалуйста, введите название видео')
      return
    }

    if (!video) return

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      if (formData.videos.length > 0) {
        formDataToSend.append('video', formData.videos[0])
      }

      const response = await fetch(`/api/videos/${video.id}`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (response.ok) {
        toast.success('Видео успешно обновлено!')
        onSave()
        onClose()
      } else {
        const error = await response.json()
        toast.error(`Ошибка: ${error.error || 'Не удалось обновить видео'}`)
      }
    } catch {
      toast.error('Произошла ошибка при обновлении видео')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Редактировать видео
          </DialogTitle>
          <DialogDescription>
            Внесите изменения в данные видео. После завершения нажмите «Сохранить».
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-video-title">Название</Label>
            <Input
              id="edit-video-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-video-description">Описание</Label>
            <textarea
              id="edit-video-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full min-h-25 px-3 py-2 text-sm border rounded-md resize-y"
            />
          </div>

          <div className="grid gap-2">
            <Label>Видео файл</Label>
            <PhotoUpload
              value={formData.videos}
              onChange={(files) => setFormData(prev => ({ ...prev, videos: files }))}
              maxFiles={1}
              accept="video/*"
            />
            <p className="text-xs text-gray-500">
              Новый файл заменит существующий. Оставьте пустым, чтобы сохранить текущий.
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
