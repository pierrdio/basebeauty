"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ContentBlock {
    id: string
    type: "text" | "heading" | "subheading" | "list" | "image"
    content: string
}

interface News {
    id: number
    title: string
    cover: string | null
    blocks: string
    createdAt: string
}

export default function AllNews() {
    const [news, setNews] = useState<News[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 9

    useEffect(() => {
        fetch("/api/news")
            .then((res) => res.json())
            .then((data: News[]) => {
                if (Array.isArray(data)) {
                    setNews(data)
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    // Filter news based on search query
    const filteredNews = useMemo(() => {
        if (!searchQuery.trim()) return news

        return news.filter((item) => {
            const titleMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase())

            // Search in content blocks
            let contentMatch = false
            try {
                const blocks: ContentBlock[] = JSON.parse(item.blocks)
                contentMatch = blocks.some(block =>
                    block.content.toLowerCase().includes(searchQuery.toLowerCase())
                )
            } catch {
                // ignore parse errors
            }

            return titleMatch || contentMatch
        })
    }, [news, searchQuery])

    // Calculate pagination
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedNews = filteredNews.slice(startIndex, startIndex + itemsPerPage)

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="text-white">Загрузка...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <main className="mx-auto flex w-full max-w-7xl px-4 flex-col gap-4 pt-30">
                {/* Header */}
                <div className="max-w-xl flex-1 mb-10 w-fit p-px bg-linear-to-bl from-gray-500 via-gray-900 to-stone-200 rounded-4xl">
                    <div className="bg-black rounded-4xl p-4">
                        <h1 className="text-6xl max-sm:text-2xl font-semibold text-[#00D89F] text-center w-full">Все новости</h1>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Поиск по новостям..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-[#222] border-white/20 text-white placeholder:text-white/40 focus:border-[#1DCD9F] font-onest-medium"
                        />
                    </div>
                </div>

                {/* News Grid */}
                {paginatedNews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-white/60">
                            {searchQuery ? "По вашему запросу ничего не найдено" : "Новостей пока нет"}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-onest">
                            {paginatedNews.map((item) => {
                            // Extract first text block for preview
                            let previewText = ""
                            try {
                                const blocks: ContentBlock[] = JSON.parse(item.blocks)
                                const textBlock = blocks.find((b) => b.type === "text")
                                if (textBlock) previewText = textBlock.content
                            } catch {
                                // ignore
                            }

                            return (
                                <Link key={item.id} href={`/news/${item.id}`} className="group">
                                    <div className="bg-[#111111] rounded-xl overflow-hidden border border-white/10 hover:border-[#1DCD9F]/50 transition-all duration-300">
                                        {/* Cover Image */}
                                        <div className="aspect-video relative overflow-hidden">
                                            {item.cover ? (
                                                <Image
                                                    src={item.cover}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[#222] flex items-center justify-center">
                                                    <div className="text-white/40 text-sm">Нет изображения</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                                            </div>

                                            <h3 className="text-white font-semibold text-lg mb-3 line-clamp-2 group-hover:text-[#1DCD9F] transition-colors">
                                                {item.title}
                                            </h3>

                                            <p className="text-white/70 text-sm line-clamp-3">
                                                {previewText
                                                    ? previewText.length > 150
                                                        ? previewText.slice(0, 150) + "..."
                                                        : previewText
                                                    : "Нет описания"}
                                            </p>

                                            <div className="mt-4">
                                                <span className="text-[#1DCD9F] text-sm font-medium group-hover:underline">
                                                    Читать далее →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 my-12 ">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="bg-[#111111] border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum
                                    if (totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i
                                    } else {
                                        pageNum = currentPage - 2 + i
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className={
                                                currentPage === pageNum
                                                    ? "bg-[#1DCD9F] text-black hover:bg-[#1DCD9F]/90"
                                                    : "bg-[#111111] border-white/20 text-white hover:bg-white/40"
                                            }
                                        >
                                            {pageNum}
                                        </Button>
                                    )
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="bg-[#111111] border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
            </main>
        </div>
    )
}