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
                        <div className="flex items-start">
                            <div className="p-px bg-linear-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-xl h-fit">
                                <div className="bg-black rounded-xl px-6 py-2.5">
                                    <h3 className="text-[#1DCD9F] text-2xl font-bold wrap-break-word">{current.title}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="flex-1 p-px bg-linear-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-xl">
                            <div className="bg-[#111111] rounded-xl p-6 h-full overflow-hidden">
                                <p className="text-white/80 text-base leading-relaxed wrap-break-word">
                                    {previewText
                                        ? previewText.length > 600
                                            ? previewText.slice(0, 600) + "..."
                                            : previewText
                                        : "Нет описания"}
                                </p>
                            </div>
                        </div>

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

                    {/* Right column: Cover image with "Наши соцсети" cutout */}
                    <div className="flex-1 rounded-2xl relative overflow-hidden min-h-[45rem]">
                        {current.cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={current.cover}
                                alt={current.title}
                                className="w-full h-full object-cover rounded-2xl absolute inset-0"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#1a1a1a] rounded-2xl absolute inset-0" />
                        )}

                        {/* Mask: background-colored shape that cuts into the image */}
                        <div className="absolute bottom-0 right-0 bg-[#222] rounded-tl-3xl pt-4 pl-4 z-10">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="default"
                                        className="w-85 bg-[#0a0a0a/100] border-[#1DCD9F] border-2 rounded-xl h-auto py-4 text-white text-2xl font-semibold hover:bg-[#151515] font-onest-medium cursor-pointer"
                                    >
                                        Наши соцсети
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md bg-[#0a0a0a] border-[#1DCD9F]/30">
                                    <DialogHeader>
                                        <DialogTitle className="text-[#1DCD9F] text-2xl font-bold text-center">
                                            Наши социальные сети
                                        </DialogTitle>
                                        <DialogDescription className="text-white/70 text-center">
                                            Присоединяйтесь к нам в социальных сетях
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex flex-col gap-4 py-4">
                                        {/* Telegram */}
                                        <a
                                            href="https://t.me/your_telegram"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group"
                                        >
                                            <div className="p-px bg-gradient-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-xl hover:from-[#1DCD9F] hover:via-[#1DCD9F]/50 hover:to-[#1DCD9F]/30 transition-all duration-300">
                                                <div className="bg-[#111111] rounded-xl p-4 flex items-center gap-4 group-hover:bg-[#151515] transition-all">
                                                    <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center shrink-0">
                                                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 font-onest">
                                                        <h4 className="text-white font-semibold text-lg">Telegram</h4>
                                                        <p className="text-white/60 text-sm">Следите за новостями</p>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-[#1DCD9F] group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </a>

                                        {/* VK */}
                                        <a
                                            href="https://vk.com/your_vk"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group"
                                        >
                                            <div className="p-px bg-gradient-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-xl hover:from-[#1DCD9F] hover:via-[#1DCD9F]/50 hover:to-[#1DCD9F]/30 transition-all duration-300">
                                                <div className="bg-[#111111] rounded-xl p-4 flex items-center gap-4 group-hover:bg-[#151515] transition-all">
                                                    <div className="w-12 h-12 rounded-full bg-[#0077FF] flex items-center justify-center shrink-0">
                                                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.15 14.41h-1.41c-.58 0-.76-.47-1.8-1.51-.91-.88-1.31-1-1.53-1-.32 0-.41.09-.41.53v1.38c0 .37-.12.59-1.09.59-1.6 0-3.38-.97-4.63-2.78-1.89-2.58-2.4-4.53-2.4-4.93 0-.22.09-.42.53-.42h1.41c.4 0 .55.18.7.61.78 2.15 2.09 4.03 2.63 4.03.2 0 .29-.09.29-.61v-2.37c-.06-1.12-.65-1.22-.65-1.62 0-.18.15-.36.38-.36h2.22c.33 0 .45.18.45.58v3.2c0 .33.15.45.24.45.2 0 .36-.12.73-.49 1.13-1.27 1.94-3.23 1.94-3.23.11-.22.28-.42.7-.42h1.41c.42 0 .51.22.42.58-.16.85-1.78 3.46-1.78 3.46-.17.27-.23.39 0 .7.17.23.73.71 1.1 1.14.67.77 1.18 1.41 1.32 1.86.13.44-.08.67-.51.67z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 font-onest">
                                                        <h4 className="text-white font-semibold text-lg">ВКонтакте</h4>
                                                        <p className="text-white/60 text-sm">Наше сообщество</p>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-[#1DCD9F] group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
