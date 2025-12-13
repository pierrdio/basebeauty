"use client"

import { Bell, Cloud, MessageSquare, Eye } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useState } from "react"
import { toast } from "sonner"

interface AppHeaderProps {
  newSubmissions?: number
  newSubmissionsList?: any[]
  onStatusUpdate?: () => void
}

export function AppHeader({ newSubmissions = 0, newSubmissionsList = [], onStatusUpdate }: AppHeaderProps) {
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
    <>
      <header className="bg-background/95 sticky top-0 z-10 flex h-16 items-center gap-3 border-b px-4 backdrop-blur">
      <SidebarTrigger />
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-xl font-semibold">Панель управления</h1>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-2xl"
              >
                <Bell className="h-5 w-5" />
                {newSubmissions > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {newSubmissions}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end">
              <div className="border-b px-4 py-3">
                <h4 className="font-semibold">Новые обращения</h4>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {newSubmissionsList.length > 0 ? (
                  newSubmissionsList.map((submission) => (
                    <div 
                      key={submission.id} 
                      className="border-b px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => handleOpenSubmission(submission)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{submission.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{submission.phone}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(submission.createdAt).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Новое
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Нет новых уведомлений
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Avatar className="border-primary h-9 w-9 border-2">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
    
    {/* Submission Details Dialog */}
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
    </>
  )
}

