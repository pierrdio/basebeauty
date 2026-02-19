"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AspectRatio } from "@/components/ui/aspect-ratio"

type BlockType = "text" | "heading" | "subheading" | "list" | "image"

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
        <main className="mx-auto w-full max-w-3xl px-6 pt-30 pb-20">
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
                            case "list":
                                return (
                                    <ul
                                        key={block.id}
                                        className="space-y-2 text-gray-300 text-lg pl-5"
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
                                        className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap wrap-break-word"
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
