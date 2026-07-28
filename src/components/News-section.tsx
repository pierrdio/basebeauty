"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"

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

export default function NewsSection() {
    const [news, setNews] = useState<News[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(20)
    const [fading, setFading] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const autoScrollCounterRef = useRef(0)

    const INTERVAL_SECONDS = 20

    const changeSlide = useCallback((getNext: (prev: number) => number) => {
        setFading(true)
        setTimeout(() => {
            setActiveIndex(getNext)
            setTimeLeft(INTERVAL_SECONDS)
            setFading(false)
        }, 300)
    }, [])

    const nextSlide = useCallback(() => {
        const maxSlides = Math.min(5, news.length)
        setFading(true)
        setActiveIndex((currentIndex) => (currentIndex + 1) % maxSlides)
        setTimeout(() => setFading(false), 300)
    }, [news.length])

    useEffect(() => {
        fetch("/api/news")
            .then((res) => res.json())
            .then((data: News[]) => {
                if (Array.isArray(data) && data.length > 0) {
                    setNews(data)
                }
            })
            .catch(() => { })
    }, [])

    // Sync ref with activeIndex
    useEffect(() => {
        autoScrollCounterRef.current = activeIndex
    }, [activeIndex])

    // Ensure activeIndex is always within bounds
    // useEffect(() => {
    //     const maxSlides = Math.min(5, news.length)
    //     if (activeIndex >= maxSlides && maxSlides > 0) {
    //         setActiveIndex(0)
    //     }
    // }, [news.length, activeIndex])

    // Auto-scroll every 20 seconds (completely independent)
    useEffect(() => {
        const maxSlides = Math.min(5, news.length)
        if (maxSlides <= 1) return

        const autoScrollInterval = setInterval(() => {
            autoScrollCounterRef.current = (autoScrollCounterRef.current + 1) % maxSlides
            setActiveIndex(autoScrollCounterRef.current)
            setTimeLeft(INTERVAL_SECONDS)
        }, INTERVAL_SECONDS * 1000)

        return () => clearInterval(autoScrollInterval)
    }, [news.length])

    // Timer countdown (separate from auto-scroll)
    useEffect(() => {
        if (timeLeft <= 0) return

        const countdownInterval = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1))
        }, 1000)

        return () => clearInterval(countdownInterval)
    }, [timeLeft])

    if (news.slice(0, 5).length === 0) return null

    const current = news[activeIndex]

    // Extract first text block for preview
    let previewText = ""
    try {
        const blocks: ContentBlock[] = JSON.parse(current.blocks)
        const textBlock = blocks.find((b) => b.type === "text")
        if (textBlock) previewText = textBlock.content
    } catch {
        // ignore
    }

    return (
        <section className="relative w-full py-20">
            <div className="relative max-w-7xl mx-auto px-4">
                {/* Title */}
                <div className="flex justify-center mb-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-px bg-linear-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-xl">
                            <div className="bg-[#000] rounded-xl px-10 py-3">
                                <h2 className="text-[#1DCD9F] text-4xl sm:text-5xl lg:text-6xl font-bold text-center">Новости</h2>
                            </div>
                        </div>
                    </div>
                </div>
                <Link href="/all-news" className="flex items-center justify-center my-10 text-white text-xl font-semibold underline font-onest-medium group hover:text-[#1DCD9F] transition-colors duration-300"> 
                    Все новости
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                {/* Pagination dots + arrow */}
                <div className="flex items-center mb-8">
                    {news.slice(0, 5).map((_, index) => (
                        <div key={index} className="flex items-center">
                            <Button
                                onClick={() => changeSlide(() => index)}
                                variant="ghost"
                                size="icon-sm"
                                className="shrink-0 p-0 hover:bg-transparent"
                            >
                                <div
                                    className="rounded-full transition-all duration-300 border-2"
                                    style={{
                                        width: 22,
                                        height: 22,
                                        borderColor: activeIndex === index ? "#1DCD9F" : "#444",
                                        backgroundColor: activeIndex === index ? "#1DCD9F" : "transparent",
                                        cursor: "pointer",
                                    }}
                                />
                            </Button>
                            {index < news.slice(0, 5).length - 1 && (
                                <div className="w-6 h-0.5 bg-[#444] mx-1" />
                            )}
                        </div>
                    ))}
                    <div className="w-6 h-0.5 bg-[#444] mx-1" />
                    <Button
                        onClick={() => changeSlide((prev) => (prev + 1) % Math.min(5, news.length))}
                        variant="ghost"
                        size="icon"
                        className="p-0 hover:bg-transparent cursor-pointer"
                    >
                        <div className="p-px bg-linear-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-full">
                            <div className="bg-[#222222] rounded-full w-10 h-10 flex items-center justify-center">
                                <ArrowRight className="w-5 h-5 text-[#1DCD9F]" />
                            </div>
                        </div>
                    </Button>

                    {/* Timer bar */}
                    {news.slice(0, 5).length > 1 && (
                        <div className="ml-4 flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#1DCD9F] rounded-full transition-all duration-1000 linear"
                                style={{ width: `${(timeLeft / INTERVAL_SECONDS) * 100}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Content: text + image */}
                <div className={`flex flex-col md:flex-row gap-5 transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}>
                    {/* Left column: Title + Text + Подробнее */}
                    <div className="flex-1 flex flex-col gap-5 min-w-0">
                        {/* Title badge */}
                        <Link href={`/news/${current.id}`} className="flex items-start group min-w-0 w-full">
                            <div className="p-px bg-linear-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-xl h-fit group-hover:from-[#1DCD9F]/50 group-hover:to-[#1DCD9F]/20 transition-all duration-300 min-w-0 w-full">
                                <div className="bg-black rounded-xl px-6 py-2.5">
                                    <h3 className="text-[#1DCD9F] text-2xl font-bold break-all">{current.title}</h3>
                                </div>
                            </div>
                        </Link>

                        {/* Text */}
                        <Link href={`/news/${current.id}`} className="flex-1 min-h-0 p-px bg-linear-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-xl hover:from-[#1DCD9F]/50 hover:to-[#1DCD9F]/20 transition-all duration-300">
                            <div className="bg-[#111111] rounded-xl p-6 h-full overflow-hidden">
                                <p className="text-white/80 text-base leading-relaxed wrap-break-word line-clamp-[12]">
                                    {previewText || "Нет описания"}
                                </p>
                            </div>
                        </Link>

                        {/* Подробнее button */}
                        <Button
                            asChild
                            variant="default"
                            className="w-full bg-[#0a0a0a/100] border-[#1DCD9F] border-2 rounded-xl h-auto py-4 text-white text-2xl font-semibold hover:bg-[#151515] font-onest-medium"
                        >
                            <Link href={`/news/${current.id}`}>
                                Подробнее
                            </Link>
                        </Button>
                    </div>

                    {/* Right column: Cover image/video with "Наши соцсети" cutout */}
                    <div className="flex-1 rounded-2xl relative overflow-hidden min-h-[45rem]">
                        {current.cover ? (
                            /\.(mp4|webm|mov)$/i.test(current.cover) ? (
                                <video
                                    src={current.cover}
                                    className="w-full h-full object-cover rounded-2xl absolute inset-0"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={current.cover}
                                    alt={current.title}
                                    className="w-full h-full object-cover rounded-2xl absolute inset-0"
                                />
                            )
                        ) : (
                            <div className="w-full h-full bg-[#1a1a1a] rounded-2xl absolute inset-0" />
                        )}

                        
                    </div>
                </div>
            </div>
        </section>
    )
}
