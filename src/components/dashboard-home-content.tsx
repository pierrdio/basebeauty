"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Heart, MessageSquare, Star, Users, Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

import { apps, communityPosts, projects, recentFiles } from "./data"

interface HomeContentProps {
  onTabChange?: (tab: string) => void
  recentSubmissions?: any[]
  recentWorks?: any[]
  onStatusUpdate?: () => void
}

export function HomeContent({ onTabChange, recentSubmissions = [], recentWorks = [], onStatusUpdate }: HomeContentProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenSubmission = (submission: any) => {
    setSelectedSubmission(submission)
    setIsDialogOpen(true)
  }

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contact/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setSelectedSubmission((prev: any) => prev ? { ...prev, status: newStatus } : null)
        toast.success('Статус успешно обновлен')
        // Trigger live update in parent
        onStatusUpdate?.()
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      toast.error('Ошибка при обновлении статуса')
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl bg-black p-8 text-white"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Добро пожаловать в панель управления!</h2>
              <p className="max-w-[600px] text-white/80">
                Здесь вы можете добавлять новые работы в портфолио, отслеживать обращения
              </p>
            </div>
            <div className="hidden lg:block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 50,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="relative h-40 w-40"
              >
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                <div className="absolute inset-4 rounded-full bg-white/20" />
                <div className="absolute inset-8 rounded-full bg-white/30" />
                <div className="absolute inset-12 rounded-full bg-white/40" />
                <div className="absolute inset-16 rounded-full bg-white/50" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Недавние обращения</h2>
            <Button
              variant="ghost"
              value="offers"
              className="rounded-2xl cursor-pointer"
              onClick={() => onTabChange?.("offers")}
            >
              Смотреть все
            </Button>
          </div>
          <div className="rounded-3xl border">
            <div className="grid grid-cols-1 divide-y">
              {recentSubmissions.slice(0, 3).map((submission) => (
                <motion.div
                  key={submission.id}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => handleOpenSubmission(submission)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 flex h-10 w-10 items-center justify-center rounded-2xl">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{submission.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {submission.phone} • {new Date(submission.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={submission.status === 'new' ? 'default' : submission.status === 'in_progress' ? 'secondary' : 'outline'} className="rounded-xl">
                      {submission.status === 'new' ? 'Новый' : submission.status === 'in_progress' ? 'В работе' : 'Завершен'}
                    </Badge>
                    <Button variant="ghost" size="sm" className="rounded-xl p-1">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {recentSubmissions.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  Нет недавних обращений
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Последние работы</h2>
            <Button
              variant="ghost"
              value="offers"
              className="rounded-2xl cursor-pointer"
              onClick={() => onTabChange?.("works")}
            >
              Смотреть все
            </Button>
          </div>
          <div className="rounded-3xl border">
            <div className="grid grid-cols-1 divide-y">
              {recentWorks.slice(0, 3).map((work) => (
                <motion.div
                  key={work.id}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  className="p-4 overflow-hidden"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium truncate pr-2" title={work.title}>
                      {work.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm line-clamp-2 overflow-hidden">
                    {work.description || 'Нет описания'}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Создано {new Date(work.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </motion.div>
              ))}
              {recentWorks.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  Нет последних работ
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* View Submission Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Детали обращения
            </DialogTitle>
            <DialogDescription>
              Полная информация о клиентском обращении.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="view-name">Имя</Label>
                <div className="w-full bg-gray-50 border rounded-md px-3 py-2 text-sm">
                  {selectedSubmission.name}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="view-phone">Телефон</Label>
                <div className="w-full bg-gray-50 border rounded-md px-3 py-2 text-sm">
                  {selectedSubmission.phone}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="view-message">Сообщение</Label>
                <textarea 
                  id="view-message"
                  value={selectedSubmission.message || ''}
                  readOnly
                  className="w-full min-h-[120px] px-3 py-2 text-sm border rounded-md bg-gray-50 resize-none overflow-y-auto"
                  rows={5}
                />
              </div>
              
              {selectedSubmission.fileName && (
                <div className="grid gap-2">
                  <Label htmlFor="view-file">Файл</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-50 border rounded-md px-3 py-2 text-sm">
                      {selectedSubmission.fileName}
                    </div>
                    {selectedSubmission.fileUrl && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(selectedSubmission.fileUrl, '_blank')}
                      >
                        Открыть
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="view-status">Статус</Label>
                <Select
                  value={selectedSubmission.status}
                  onValueChange={(newStatus) => handleStatusChange(selectedSubmission.id, newStatus)}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Новый</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="completed">Завершен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="view-date">Дата создания</Label>
                  <div className="w-full bg-gray-50 border rounded-md px-3 py-2 text-sm">
                    {new Date(selectedSubmission.createdAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
