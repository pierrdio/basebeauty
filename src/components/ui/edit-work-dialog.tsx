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

interface Work {
  id: number
  title: string
  description: string
  photos: string
  createdAt: string
  updatedAt: string
}

interface EditWorkDialogProps {
  work: Work | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditWorkDialog({ work, isOpen, onClose, onSave }: EditWorkDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    photos: [] as File[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when work changes
  useEffect(() => {
    if (work) {
      setFormData({
        title: work.title,
        description: work.description,
        photos: []
      })
    } else {
      setFormData({
        title: "",
        description: "",
        photos: []
      })
    }
  }, [work])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Пожалуйста, введите название работы')
      return
    }

    if (!work) return

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formData.photos.forEach((photo) => {
        formDataToSend.append('photo', photo)
      })

      const response = await fetch(`/api/works/${work.id}`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Work updated successfully:', result)
        toast.success('Работа успешно обновлена!')
        onSave()
        onClose()
      } else {
        const error = await response.json()
        toast.error(`Ошибка: ${error.error || 'Не удалось обновить работу'}`)
      }
    } catch (error) {
      console.error('Error updating work:', error)
      toast.error('Произошла ошибка при обновлении работы')
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
            Редактировать работу
          </DialogTitle>
          <DialogDescription>
            Внесите изменения в данные работы. После завершения нажмите «Сохранить».
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Название</Label>
            <Input 
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Описание</Label>
            <textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full min-h-25 px-3 py-2 text-sm border rounded-md resize-y"
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Изображения</Label>
            <PhotoUpload
              value={formData.photos}
              onChange={(files) => setFormData(prev => ({ ...prev, photos: files }))}
            />
            <p className="text-xs text-gray-500">
              Новые изображения заменят существующие. Оставьте пустым, чтобы сохранить текущие.
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
