"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AspectRatio } from "@/components/ui/aspect-ratio"

type BlockType = "text" | "heading" | "subheading" | "list" | "image" | "carousel"

interface ContentBlock {
    id: string
    type: BlockType
    content: string
}

interface News {
    id: number
    title: string
    cover: string | null
    blocks: string
    createdAt: string
}

export default function NewsPage() {
    const [news, setNews] = useState<News | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeSlide, setActiveSlide] = useState<Record<string, number>>({})
    const params = useParams()
    const newsId = params.id

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(`/api/news/${newsId}`)
                if (res.ok) {
                    const data = await res.json()
                    setNews(data)
                }
            } catch (error) {
                console.error("Error fetching news:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchNews()
    }, [newsId])

    if (isLoading) {
        return (
            <main className="mx-auto w-full max-w-3xl px-4 py-10">
                <div className="text-center py-20">
                    <p className="text-xl text-gray-300">Загрузка...</p>
                </div>
            </main>
        )
    }

    if (!news) {
        return (
            <main className="mx-auto w-full max-w-3xl px-4 py-10">
                <div className="text-center py-20">
                    <p className="text-xl text-gray-300">Новость не найдена</p>
                </div>
            </main>
        )
    }

    let blocks: ContentBlock[] = []
    try {
        blocks = JSON.parse(news.blocks || "[]")
    } catch {
        blocks = []
    }

    const isVideoUrl = (url: string) =>
        url.endsWith(".mp4") || url.endsWith(".webm")

    const formattedDate = new Date(news.createdAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })

    return (
        <main className="mx-auto w-full max-w-3xl px-6 pt-30 pb-20 font-onest">
            {/* Date */}
            <span className="text-sm text-gray-300">{formattedDate}</span>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-8 leading-tight wrap-break-word">
                {news.title}
            </h1>

            {/* Cover */}
            {news.cover && (
                <div className="mb-12 rounded-2xl overflow-hidden">
                    <AspectRatio ratio={16 / 9}>
                        {isVideoUrl(news.cover) ? (
                            <video
                                src={news.cover}
                                className="w-full h-full object-cover"
                                controls
                            />
                        ) : (
                            <img
                                src={news.cover}
                                alt={news.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </AspectRatio>
                </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-800 mb-10" />

            {/* Content blocks */}
            {blocks.length > 0 && (
                <article className="space-y-8">
                    {blocks.map((block) => {
                        switch (block.type) {
                            case "heading":
                                return (
                                    <h2
                                        key={block.id}
                                        className="text-2xl md:text-3xl font-bold text-white wrap-break-word"
                                    >
                                        {block.content}
                                    </h2>
                                )
                            case "subheading":
                                return (
                                    <h3
                                        key={block.id}
                                        className="text-xl md:text-2xl font-semibold text-gray-200 wrap-break-word"
                                    >
                                        {block.content}
                                    </h3>
                                )
                            case "image":
                                return (
                                    <div key={block.id} className="rounded-2xl overflow-hidden">
                                        <AspectRatio ratio={16 / 9}>
                                            <img
                                                src={block.content}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </AspectRatio>
                                    </div>
                                )
                            case "carousel":
                                const carouselImages = block.content ? JSON.parse(block.content) : []
                                if (carouselImages.length === 0) return null

                                return (
                                    <div key={block.id} className="relative overflow-hidden rounded-2xl">
                                        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${activeSlide[block.id] || 0}00%)` }}>
                                            {carouselImages.map((imageUrl: string, index: number) => (
                                                <div key={index} className="shrink-0 w-full">
                                                    <AspectRatio ratio={16 / 9}>
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Изображение ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </AspectRatio>
                                                </div>
                                            ))}
                                        </div>

                                        {carouselImages.length > 1 && (
                                            <>
                                                {/* Navigation dots */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                    {carouselImages.map((_: string, index: number) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setActiveSlide(prev => ({ ...prev, [block.id]: index }))}
                                                            className={`w-2 h-2 rounded-full transition-colors ${
                                                                (activeSlide[block.id] || 0) === index ? 'bg-white' : 'bg-white/50'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Navigation arrows */}
                                                <button
                                                    onClick={() => setActiveSlide(prev => ({
                                                        ...prev,
                                                        [block.id]: Math.max(0, (prev[block.id] || 0) - 1)
                                                    }))}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                                    disabled={(activeSlide[block.id] || 0) === 0}
                                                >
                                                    ‹
                                                </button>
                                                <button
                                                    onClick={() => setActiveSlide(prev => ({
                                                        ...prev,
                                                        [block.id]: Math.min(carouselImages.length - 1, (prev[block.id] || 0) + 1)
                                                    }))}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                                    disabled={(activeSlide[block.id] || 0) === carouselImages.length - 1}
                                                >
                                                    ›
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )
                            case "list":
                                return (
                                    <ul
                                        key={block.id}
                                        className="space-y-2 text-gray-300 text-lg font-medium pl-5"
                                    >
                                        {block.content
                                            .split("\n")
                                            .filter((line) => line.trim())
                                            .map((line, i) => (
                                                <li key={i} className="relative pl-4 wrap-break-word before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#00D89F]">
                                                    {line}
                                                </li>
                                            ))}
                                    </ul>
                                )
                            case "text":
                            default:
                                return (
                                    <p
                                        key={block.id}
                                        className="text-gray-300 text-lg font-medium leading-relaxed whitespace-pre-wrap wrap-break-word"
                                    >
                                        {block.content}
                                    </p>
                                )
                        }
                    })}
                </article>
            )}
        </main>
    )
}
