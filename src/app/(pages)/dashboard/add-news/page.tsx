"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { ChevronLeft, Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { toast } from "sonner"

type BlockType = "text" | "heading" | "subheading" | "list" | "image" | "carousel"

interface ContentBlock {
    id: string
    type: BlockType
    content: string
}

export default function AddNews() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get("id")
    const isEditMode = !!editId

    const [title, setTitle] = useState("")
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [blocks, setBlocks] = useState<ContentBlock[]>([])
    const [blockImages, setBlockImages] = useState<Record<string, File>>({})
    const [carouselImages, setCarouselImages] = useState<Record<string, File[]>>({})
    const [carouselExistingUrls, setCarouselExistingUrls] = useState<Record<string, string[]>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const titleRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (editId) {
            setIsLoading(true)
            fetch(`/api/news/${editId}`)
                .then((res) => res.json())
                .then((data) => {
                    setTitle(data.title || "")
                    if (data.cover) setCoverPreview(data.cover)
                    try {
                        const parsed = JSON.parse(data.blocks || "[]")
                        setBlocks(parsed)
                        const existingUrls: Record<string, string[]> = {}
                        for (const b of parsed) {
                            if (b.type === "carousel" && b.content) {
                                try { existingUrls[b.id] = JSON.parse(b.content) } catch {}
                            }
                        }
                        setCarouselExistingUrls(existingUrls)
                    } catch {
                        setBlocks([])
                    }
                })
                .catch(() => toast.error("Не удалось загрузить новость"))
                .finally(() => setIsLoading(false))
        }
    }, [editId])

    const isVideo = (file: File) => file.type.startsWith("video/")

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        const isImg = file.type.startsWith("image/")
        const isVid = file.type.startsWith("video/")
        const maxSize = isVid ? 50 * 1024 * 1024 : 30 * 1024 * 1024

        if (!isImg && !isVid) {
            toast.error("Поддерживаются только изображения (JPG, JPEG, PNG) и видео (MP4, WebM)")
            return
        }

        if (file.size > maxSize) {
            toast.error(`Файл слишком большой. Максимум ${isVid ? "50" : "30"} Мб`)
            return
        }

        if (coverPreview) URL.revokeObjectURL(coverPreview)
        setCoverFile(file)
        setCoverPreview(URL.createObjectURL(file))
    }, [coverPreview])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpg", ".jpeg", ".png"],
            "video/*": [".mp4", ".webm", ".mov"],
        },
        multiple: false,
    })

    const removeCover = () => {
        if (coverPreview) URL.revokeObjectURL(coverPreview)
        setCoverFile(null)
        setCoverPreview(null)
    }

    const addBlock = (type: BlockType) => {
        const newBlock: ContentBlock = {
            id: Date.now().toString(),
            type,
            content: "",
        }
        setBlocks((prev) => [...prev, newBlock])
    }

    const updateBlock = (id: string, content: string) => {
        setBlocks((prev) =>
            prev.map((b) => (b.id === id ? { ...b, content } : b))
        )
    }

    const removeBlock = (id: string) => {
        setBlocks((prev) => prev.filter((b) => b.id !== id))
        setBlockImages((prev) => {
            const next = { ...prev }
            delete next[id]
            return next
        })
        setCarouselImages((prev) => {
            const next = { ...prev }
            delete next[id]
            return next
        })
        setCarouselExistingUrls((prev) => {
            const next = { ...prev }
            delete next[id]
            return next
        })
    }

    const handleBlockImageSelect = (blockId: string, file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Поддерживаются только изображения")
            return
        }
        if (file.size > 30 * 1024 * 1024) {
            toast.error("Файл слишком большой. Максимум 30 Мб")
            return
        }

        setBlockImages((prev) => ({ ...prev, [blockId]: file }))
        const previewUrl = URL.createObjectURL(file)
        updateBlock(blockId, previewUrl)
    }

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Введите название новости")
            return
        }

        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("title", title)
            const blocksToSend = blocks.map(block => {
                if (block.type === "carousel") {
                    return { ...block, content: JSON.stringify(carouselExistingUrls[block.id] || []) }
                }
                return block
            })
            formData.append("blocks", JSON.stringify(blocksToSend))
            if (coverFile) {
                formData.append("cover", coverFile)
            }

            // Append block images
            for (const [blockId, file] of Object.entries(blockImages)) {
                formData.append(`block-image-${blockId}`, file)
            }

            // Append carousel images
            for (const [blockId, files] of Object.entries(carouselImages)) {
                files.forEach((file, index) => {
                    formData.append(`carousel-image-${blockId}-${index}`, file)
                })
            }

            const url = editId ? `/api/news/${editId}` : "/api/news/add"
            const method = editId ? "PUT" : "POST"

            const response = await fetch(url, { method, body: formData })

            if (response.ok) {
                toast.success(editId ? "Новость обновлена!" : "Новость успешно добавлена!")
                router.push("/dashboard")
            } else {
                const error = await response.json()
                toast.error(`Ошибка: ${error.error || "Не удалось сохранить новость"}`)
            }
        } catch (error) {
            console.error("Error submitting news:", error)
            toast.error("Произошла ошибка при отправке")
        } finally {
            setIsSubmitting(false)
        }
    }

    const blockTypeOptions: { type: BlockType; icon: React.ReactNode; label: string; desc: string }[] = [
        {
            type: "text",
            icon: <span className="text-lg font-serif font-semibold">Aa</span>,
            label: "Текст",
            desc: "Простое текстовое описание",
        },
        {
            type: "heading",
            icon: <span className="text-lg font-bold">H<sub>1</sub></span>,
            label: "Заголовок",
            desc: "Большой заголовок раздела",
        },
        {
            type: "subheading",
            icon: <span className="text-lg font-bold">H<sub>2</sub></span>,
            label: "Подзаголовок",
            desc: "Средний заголовок раздела",
        },
        {
            type: "list",
            icon: (
                <div className="flex flex-col gap-[2px]">
                    <div className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-current" />
                        <span className="w-4 h-[2px] bg-current rounded" />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-current" />
                        <span className="w-4 h-[2px] bg-current rounded" />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-current" />
                        <span className="w-4 h-[2px] bg-current rounded" />
                    </div>
                </div>
            ),
            label: "Список",
            desc: "Маркированный список",
        },
        {
            type: "image",
            icon: <ImageIcon className="w-5 h-5" />,
            label: "Фотография",
            desc: "Загрузить изображение",
        },
        {
            type: "carousel",
            icon: (
                <div className="flex gap-1">
                    <div className="w-2 h-5 bg-current rounded" />
                    <div className="w-2 h-5 bg-current rounded opacity-60" />
                    <div className="w-2 h-5 bg-current rounded opacity-30" />
                </div>
            ),
            label: "Карусель изображений",
            desc: "Загрузить несколько изображений",
        },
    ]

    return (
        <div className="min-h-screen bg-[#f5f5f5] font-onest">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="fixed top-6 left-6 z-10 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                )}

                {/* Cover upload */}
                <div className="bg-white rounded-2xl p-8">
                    {coverPreview ? (
                        <div className="relative rounded-xl overflow-hidden">
                            <AspectRatio ratio={16 / 9}>
                                {coverFile && isVideo(coverFile) ? (
                                    <video
                                        src={coverPreview}
                                        className="w-full h-full object-cover"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={coverPreview}
                                        alt="Обложка"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </AspectRatio>
                            <button
                                onClick={removeCover}
                                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
                                isDragActive
                                    ? "border-black bg-gray-50"
                                    : "border-gray-300 hover:border-gray-400"
                            }`}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Upload className="w-7 h-7 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-gray-900">
                                        Добавить обложку
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Фото (JPG, JPEG, PNG) до 30 Мб, видео (MP4, WebM, MOV) до 50 Мб
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="rounded-full px-6 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                                    type="button"
                                >
                                    Загрузить с компьютера
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Title */}
                <div className="bg-white rounded-2xl p-8">
                    <textarea
                        ref={titleRef}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Введите название"
                        className="w-full text-3xl font-bold text-gray-900 placeholder:text-gray-300 resize-none border-none outline-none bg-transparent"
                        rows={1}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement
                            target.style.height = "auto"
                            target.style.height = target.scrollHeight + "px"
                        }}
                    />
                </div>

                {/* Description blocks */}
                <div className="bg-white rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Содержание
                    </h2>

                    {/* Existing blocks */}
                    {blocks.length > 0 && (
                        <div className="space-y-4 mb-6">
                            {blocks.map((block) => (
                                <div key={block.id} className="group relative">
                                    {block.type === "heading" && (
                                        <input
                                            type="text"
                                            value={block.content}
                                            onChange={(e) =>
                                                updateBlock(block.id, e.target.value)
                                            }
                                            placeholder="Заголовок"
                                            className="w-full text-2xl font-bold text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent"
                                        />
                                    )}
                                    {block.type === "subheading" && (
                                        <input
                                            type="text"
                                            value={block.content}
                                            onChange={(e) =>
                                                updateBlock(block.id, e.target.value)
                                            }
                                            placeholder="Подзаголовок"
                                            className="w-full text-xl font-semibold text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent"
                                        />
                                    )}
                                    {block.type === "text" && (
                                        <textarea
                                            ref={(el) => {
                                                if (el) {
                                                    el.style.height = "auto"
                                                    el.style.height = el.scrollHeight + "px"
                                                }
                                            }}
                                            value={block.content}
                                            onChange={(e) =>
                                                updateBlock(block.id, e.target.value)
                                            }
                                            placeholder="Начните печатать..."
                                            className="w-full text-base text-gray-700 placeholder:text-gray-300 resize-none border-none outline-none bg-transparent"
                                            rows={2}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement
                                                target.style.height = "auto"
                                                target.style.height = target.scrollHeight + "px"
                                            }}
                                        />
                                    )}
                                    {block.type === "list" && (
                                        <textarea
                                            ref={(el) => {
                                                if (el) {
                                                    el.style.height = "auto"
                                                    el.style.height = el.scrollHeight + "px"
                                                }
                                            }}
                                            value={block.content}
                                            onChange={(e) =>
                                                updateBlock(block.id, e.target.value)
                                            }
                                            placeholder="Элемент списка (каждая строка — новый пункт)"
                                            className="w-full text-base text-gray-700 placeholder:text-gray-300 resize-none border-none outline-none bg-transparent pl-4 border-l-2 border-l-gray-200"
                                            rows={3}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement
                                                target.style.height = "auto"
                                                target.style.height = target.scrollHeight + "px"
                                            }}
                                        />
                                    )}
                                    {block.type === "image" && (
                                        <div>
                                            {block.content ? (
                                                <div className="rounded-xl overflow-hidden">
                                                    <AspectRatio ratio={16 / 9}>
                                                        <img
                                                            src={block.content}
                                                            alt="Изображение"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </AspectRatio>
                                                </div>
                                            ) : (
                                                <label className="block cursor-pointer">
                                                    <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl transition-colors">
                                                        <AspectRatio ratio={16 / 9}>
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                                <ImageIcon className="w-10 h-10 text-gray-300" />
                                                                <p className="text-sm text-gray-400">
                                                                    Нажмите, чтобы выбрать изображение
                                                                </p>
                                                            </div>
                                                        </AspectRatio>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/jpg"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) handleBlockImageSelect(block.id, file)
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    )}
                                    {block.type === "carousel" && (
                                        <div>
                                            <input
                                                id={`carousel-input-${block.id}`}
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || [])
                                                    const validFiles = files.filter(file => {
                                                        if (!file.type.startsWith("image/")) {
                                                            toast.error("Поддерживаются только изображения")
                                                            return false
                                                        }
                                                        if (file.size > 30 * 1024 * 1024) {
                                                            toast.error("Файл слишком большой. Максимум 30 Мб")
                                                            return false
                                                        }
                                                        return true
                                                    })
                                                    if (validFiles.length > 0) {
                                                        setCarouselImages(prev => ({
                                                            ...prev,
                                                            [block.id]: [...(prev[block.id] || []), ...validFiles]
                                                        }))
                                                    }
                                                    e.target.value = ''
                                                }}
                                            />
                                            {(carouselExistingUrls[block.id]?.length > 0 || carouselImages[block.id]?.length > 0) ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {carouselExistingUrls[block.id]?.map((url, index) => (
                                                            <div key={`existing-${index}`} className="relative">
                                                                <div className="aspect-square rounded-lg overflow-hidden">
                                                                    <img
                                                                        src={url}
                                                                        alt={`Изображение ${index + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setCarouselExistingUrls(prev => ({
                                                                            ...prev,
                                                                            [block.id]: prev[block.id].filter((_, i) => i !== index)
                                                                        }))
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-75 hover:opacity-100 z-10"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {carouselImages[block.id]?.map((file, index) => (
                                                            <div key={`new-${index}`} className="relative">
                                                                <div className="aspect-square rounded-lg overflow-hidden">
                                                                    <img
                                                                        src={URL.createObjectURL(file)}
                                                                        alt={`Изображение ${index + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setCarouselImages(prev => ({
                                                                            ...prev,
                                                                            [block.id]: prev[block.id].filter((_, i) => i !== index)
                                                                        }))
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-75 hover:opacity-100 z-10"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        type="button"
                                                        onClick={() => {
                                                            const fileInput = document.getElementById(`carousel-input-${block.id}`) as HTMLInputElement
                                                            if (fileInput) fileInput.click()
                                                        }}
                                                    >
                                                        Добавить ещё
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div
                                                        className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl transition-colors cursor-pointer"
                                                        onClick={() => {
                                                            const fileInput = document.getElementById(`carousel-input-${block.id}`) as HTMLInputElement
                                                            if (fileInput) fileInput.click()
                                                        }}
                                                    >
                                                        <AspectRatio ratio={16 / 9}>
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                                <ImageIcon className="w-10 h-10 text-gray-300" />
                                                                <p className="text-sm text-gray-400">
                                                                    Нажмите, чтобы выбрать изображения для карусели
                                                                </p>
                                                            </div>
                                                        </AspectRatio>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        type="button"
                                                        onClick={() => {
                                                            const fileInput = document.getElementById(`carousel-input-${block.id}`) as HTMLInputElement
                                                            if (fileInput) fileInput.click()
                                                        }}
                                                    >
                                                        Добавить изображение
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeBlock(block.id)}
                                        className="absolute -right-2 -top-2 opacity-100 bg-red-500 text-white rounded-full p-1 z-10"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Block type selector */}
                    {blocks.length === 0 && (
                        <p className="text-gray-400 mb-6">
                            Начните печатать, чтобы добавить описание
                        </p>
                    )}

                    <div className="space-y-1">
                        {blockTypeOptions.map((opt) => (
                            <button
                                key={opt.type}
                                onClick={() => addBlock(opt.type)}
                                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="w-8 h-8 flex items-center justify-center text-gray-500">
                                    {opt.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {opt.label}
                                    </p>
                                    <p className="text-xs text-gray-500">{opt.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pb-10">
                    <Button
                        variant="outline"
                        className="rounded-xl px-6"
                        onClick={() => router.back()}
                    >
                        Отмена
                    </Button>
                    <Button
                        className="rounded-xl px-6 bg-gray-900 hover:bg-gray-800 text-white"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Сохранение..." : isEditMode ? "Сохранить" : "Опубликовать"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
