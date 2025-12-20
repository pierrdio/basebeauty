"use client"

import { useState, useEffect, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Download, Plus } from "lucide-react"

import { AppHeader } from "@/components/dashboard-header"
import { AppSidebar } from "@/components/dashboard-sidebar"
import { HomeContent } from "@/components/dashboard-home-content"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { DynamicTable } from "@/components/dynamicTable"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhotoUpload } from "@/components/ui/photo-upload"
import { toast } from "sonner"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home")
  const [works, setWorks] = useState<any[]>([])
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    photos: [] as File[]
  })

  useEffect(() => {
    fetchWorks()
    fetchContactSubmissions()
  }, [])

  useEffect(() => {
    if (activeTab === "works") {
      fetchWorks()
    }
  }, [activeTab])

  const fetchWorks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/works')
      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard - Raw works data:', data)
        console.log('Dashboard - First work structure:', data[0])
        setWorks(data)
      }
    } catch (error) {
      console.error('Error fetching works:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContactSubmissions = async () => {
    try {
      const response = await fetch('/api/contact/submissions')
      if (response.ok) {
        const data = await response.json()
        setContactSubmissions(data)
      }
    } catch (error) {
      console.error('Error fetching contact submissions:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Пожалуйста, введите название работы')
      return
    }

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formData.photos.forEach((photo) => {
        formDataToSend.append('photo', photo)
      })

      const response = await fetch('/api/works/add', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Work added successfully:', result)
        // Reset form
        setFormData({ title: '', description: '', photos: [] })
        // Refresh works list
        fetchWorks()
        // Close sheet (you might need to add state for this)
        toast.success('Работа успешно добавлена!')
      } else {
        const error = await response.json()
        toast.error(`Ошибка: ${error.error || 'Не удалось добавить работу'}`)
      }
    } catch (error) {
      console.error('Error submitting work:', error)
      toast.error('Произошла ошибка при отправке формы')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Count new submissions for notifications
  const newSubmissionsCount = useMemo(() => {
    return contactSubmissions.filter(submission => submission.status === 'new').length;
  }, [contactSubmissions]);

  // Get list of new submissions for notification dropdown
  const newSubmissionsList = useMemo(() => {
    return contactSubmissions
      .filter(submission => submission.status === 'new')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [contactSubmissions]);

  return (
    <div className="bg-background relative min-h-screen overflow-hidden font-onest">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 30% 70%, rgba(233, 30, 99, 0.5) 0%, rgba(81, 45, 168, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 70% 30%, rgba(76, 175, 80, 0.5) 0%, rgba(32, 119, 188, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
          ],
        }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader newSubmissions={newSubmissionsCount} newSubmissionsList={newSubmissionsList} onStatusUpdate={fetchContactSubmissions} />
          <main className="flex-1 p-4 md:p-6 font-onest">
            <Tabs
              defaultValue="home"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <TabsList className="grid w-full max-w-[600px] grid-cols-3 rounded-2xl p-1">
                  <TabsTrigger value="home" className="rounded-xl cursor-pointer">
                    Главная
                  </TabsTrigger>
                  <TabsTrigger value="works" className="rounded-xl cursor-pointer">
                    Работы
                  </TabsTrigger>
                  <TabsTrigger value="offers" className="rounded-xl cursor-pointer">
                    Обращения
                  </TabsTrigger>
                </TabsList>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="home" className="mt-0">
                    <HomeContent
                      onTabChange={setActiveTab}
                      recentSubmissions={contactSubmissions.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
                      recentWorks={works.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
                      onStatusUpdate={fetchContactSubmissions}
                    />
                  </TabsContent>
                  <TabsContent value="works" className="mt-0">
                    <div className="p-5 rounded-3xl border border-dashed">
                      <div className="flex justify-between items-center mb-4">
                        <div className="hidden gap-2 md:flex">
                          <Button className="rounded-2xl">
                            <Sheet>
                              <SheetTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <Plus className="mr-2 h-4 w-4" />
                                  <Button variant="link" className="text-white hover:underline-offset-6">Добавить работу</Button>
                                </div>
                              </SheetTrigger>
                              <SheetContent className="font-onest overflow-auto">
                                <SheetHeader>
                                  <SheetTitle>Добавить работу</SheetTitle>
                                  <SheetDescription>
                                    Внесите данные для добавления в форму ниже. После завершения нажмите «Сохранить».
                                  </SheetDescription>
                                </SheetHeader>
                                <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                                  <div className="grid gap-3">
                                    <Label htmlFor="sheet-title">Название</Label>
                                    <Input
                                      id="sheet-title"
                                      name="title"
                                      type="text"
                                      value={formData.title}
                                      onChange={handleInputChange}
                                      required
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="sheet-desc">Описание</Label>
                                    <Input
                                      id="sheet-desc"
                                      name="description"
                                      type="text"
                                      value={formData.description}
                                      onChange={handleInputChange}
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="sheet-photo">Изображения</Label>
                                    <PhotoUpload
                                      value={formData.photos}
                                      onChange={(files) => setFormData(prev => ({ ...prev, photos: files }))}
                                      maxFiles={5}
                                    />
                                  </div>
                                </form>
                                <SheetFooter>
                                  <Button type="submit" disabled={isSubmitting} onClick={handleSubmit}>
                                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                                  </Button>
                                  <SheetClose asChild>
                                    <Button variant="outline">Закрыть</Button>
                                  </SheetClose>
                                </SheetFooter>
                              </SheetContent>
                            </Sheet>
                          </Button>
                        </div>
                      </div>
                      <DynamicTable data={works.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())} onDataChange={fetchWorks} tableTitle="Работы"/>
                    </div>
                  </TabsContent>
                  <TabsContent value="offers" className="mt-0">
                    <div className="p-5 rounded-3xl border border-dashed">
                      <div className="flex justify-between items-center mb-4">
                        <div className="hidden gap-2 md:flex">
                          <Button className="rounded-2xl">
                            Обращения клиентов ({contactSubmissions.length})
                          </Button>
                        </div>
                      </div>
                      <DynamicTable data={contactSubmissions.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())} onDataChange={fetchContactSubmissions} tableTitle="Обращения" />
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
