"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface Video {
    id: number
    title: string
    description: string
    videoUrl: string
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
}

function useCarouselSizes() {
    const [sizes, setSizes] = useState({
        cardWidth: 380,
        centerWidth: 420,
        gap: 60,
        containerHeight: 700,
        centerHeight: 640,
        sideHeight: 500,
        showSides: true,
    })

    useEffect(() => {
        function update() {
            const w = window.innerWidth
            if (w < 640) {
                // Мобильные устройства
                const cw = Math.min(w * 0.75, 280)
                setSizes({ cardWidth: cw * 0.85, centerWidth: cw, gap: 16, containerHeight: cw * 1.55, centerHeight: cw * 1.15, sideHeight: cw, showSides: false })
            } else if (w < 800) {
                // Маленькие планшеты
                const cw = Math.min(w * 0.32, 300)
                setSizes({ cardWidth: cw * 0.85, centerWidth: cw, gap: 30, containerHeight: cw * 1.65, centerHeight: cw * 1.25, sideHeight: cw * 1.1, showSides: false })
            } else if (w < 1024) {
                // Большие планшеты - с маленькими боковыми видео
                setSizes({ cardWidth: 180, centerWidth: 260, gap: 50, containerHeight: 480, centerHeight: 360, sideHeight: 320, showSides: true })
            } else if (w < 1280) {
                // Маленький десктоп (1024-1280px) - компактные размеры
                setSizes({ cardWidth: 260, centerWidth: 360, gap: 60, containerHeight: 680, centerHeight: 480, sideHeight: 460, showSides: true })
            } else if (w < 1536) {
                // Средний десктоп (1280-1536px) - средние размеры
                setSizes({ cardWidth: 340, centerWidth: 450, gap: 80, containerHeight: 800, centerHeight: 580, sideHeight: 560, showSides: true })
            } else {
                // Большой десктоп (>1536px) - максимальные размеры
                setSizes({ cardWidth: 380, centerWidth: 520, gap: 100, containerHeight: 900, centerHeight: 720, sideHeight: 640, showSides: true })
            }
        }
        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    return sizes
}

export default function VideoSection() {
    const [videos, setVideos] = useState<Video[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [playingVideo, setPlayingVideo] = useState<Video | null>(null)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const carouselRef = useRef<HTMLDivElement>(null)
    const touchStartX = useRef<number>(0)
    const { cardWidth, centerWidth, gap, containerHeight, centerHeight, sideHeight, showSides } = useCarouselSizes()

    useEffect(() => {
        fetch("/api/videos")
            .then((res) => res.json())
            .then((data: Video[]) => {
                if (Array.isArray(data) && data.length > 0) {
                    setVideos(data)
                    setActiveIndex(data.length > 1 ? 1 : 0)
                }
            })
            .catch(() => {})
    }, [])

    // Определение мобильного устройства (< 800px - без боковых видео)
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 800)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const openPlayer = useCallback((video: Video) => {
        setPlayingVideo(video)
        setCurrentTime(0)
        setDuration(0)
        setIsPlaying(true)
    }, [])

    const closePlayer = useCallback(() => {
        setPlayingVideo(null)
        setIsPlaying(false)
    }, [])

    const goToNext = useCallback(() => {
        if (videos.length > 1) {
            setActiveIndex((prev) => (prev + 1) % videos.length)
        }
    }, [videos.length])

    const goToPrev = useCallback(() => {
        if (videos.length > 1) {
            setActiveIndex((prev) => (prev - 1 + videos.length) % videos.length)
        }
    }, [videos.length])

    const togglePlay = useCallback(() => {
        const v = videoRef.current
        if (!v) return
        if (v.paused) {
            v.play()
            setIsPlaying(true)
        } else {
            v.pause()
            setIsPlaying(false)
        }
    }, [])

    useEffect(() => {
        if (!playingVideo) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closePlayer()
            if (e.key === " ") {
                e.preventDefault()
                togglePlay()
            }
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [playingVideo, closePlayer, togglePlay])

    // Обработка свайпа на мобильных устройствах
    useEffect(() => {
        if (!carouselRef.current || videos.length <= 1 || !isMobile) return

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX.current = e.touches[0].clientX
        }

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX
            const diff = touchStartX.current - touchEndX

            // Если свайп достаточно длинный (больше 50px)
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    // Свайп влево - следующее видео
                    goToNext()
                } else {
                    // Свайп вправо - предыдущее видео
                    goToPrev()
                }
            }
        }

        const carousel = carouselRef.current
        carousel.addEventListener("touchstart", handleTouchStart)
        carousel.addEventListener("touchend", handleTouchEnd)

        return () => {
            carousel.removeEventListener("touchstart", handleTouchStart)
            carousel.removeEventListener("touchend", handleTouchEnd)
        }
    }, [videos.length, isMobile, goToNext, goToPrev])

    // Поддержка клавиатуры для навигации (только на десктопе)
    useEffect(() => {
        if (playingVideo || videos.length <= 1 || isMobile) return

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goToPrev()
            if (e.key === "ArrowRight") goToNext()
        }

        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [playingVideo, videos.length, isMobile, goToNext, goToPrev])

    if (videos.length === 0) return null

    const sliderProgress = videos.length > 1
        ? (activeIndex / (videos.length - 1)) * 100
        : 0

    return (
        <>
            <section className="relative w-full pt-20">
                <div className="relative w-full overflow-hidden">
                    {/* Side fades */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 lg:w-80 z-20 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(25,25,25,0.35) 0%, rgba(25,25,25,0.1) 60%, transparent 100%)" }} />
                    <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 lg:w-80 z-20 pointer-events-none" style={{ background: "linear-gradient(to left, rgba(25,25,25,0.35) 0%, rgba(25,25,25,0.1) 60%, transparent 100%)" }} />

                    {/* Навигационные стрелки - только на мобильных */}
                    {videos.length > 1 && isMobile && (
                        <>
                            <button
                                onClick={goToPrev}
                                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#1DCD9F]/10 hover:bg-[#1DCD9F]/20 border border-[#1DCD9F]/30 flex items-center justify-center transition-all duration-300 group"
                                aria-label="Предыдущее видео"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="text-[#1DCD9F] group-hover:scale-110 transition-transform"
                                >
                                    <path
                                        d="M15 18L9 12L15 6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#1DCD9F]/10 hover:bg-[#1DCD9F]/20 border border-[#1DCD9F]/30 flex items-center justify-center transition-all duration-300 group"
                                aria-label="Следующее видео"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="text-[#1DCD9F] group-hover:scale-110 transition-transform"
                                >
                                    <path
                                        d="M9 18L15 12L9 6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Carousel */}
                    <div ref={carouselRef} className="relative" style={{ height: `${containerHeight}px` }}>
                        {videos.map((video, index) => {
                            const offset = index - activeIndex
                            const isCenter = offset === 0
                            const isVisible = showSides ? Math.abs(offset) <= 1 : isCenter

                            const translateX = offset * (cardWidth + gap)
                            const width = isCenter ? centerWidth : cardWidth
                            const height = isCenter ? centerHeight : sideHeight

                            return (
                                <div
                                    key={video.id}
                                    onClick={() => {
                                        if (isCenter) openPlayer(video)
                                        else setActiveIndex(index)
                                    }}
                                    className="absolute top-1/2 left-1/2 flex flex-col items-center cursor-pointer select-none"
                                    style={{
                                        width: `${width}px`,
                                        marginLeft: `${-width / 2}px`,
                                        transform: `translateX(${translateX}px) translateY(-50%)`,
                                        zIndex: isCenter ? 10 : 5 - Math.abs(offset),
                                        opacity: isVisible ? (isCenter ? 1 : 0.65) : 0,
                                        pointerEvents: isVisible ? "auto" : "none",
                                        transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s cubic-bezier(0.4,0,0.2,1), width 0.5s cubic-bezier(0.4,0,0.2,1), margin-left 0.5s cubic-bezier(0.4,0,0.2,1)",
                                    }}
                                >
                                    {/* Title badge */}
                                    <div className="mb-4 p-px bg-linear-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-xl">
                                        <div
                                            className="bg-[#000] rounded-xl text-center"
                                            style={{
                                                padding: isCenter ? "10px 32px" : "8px 24px",
                                                transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                                            }}
                                        >
                                            <span
                                                className="font-semibold tracking-wide whitespace-nowrap"
                                                style={{
                                                    color: "#1DCD9F",
                                                    fontSize: isCenter ? "1.5rem" : "1.1rem",
                                                    transition: "font-size 0.5s cubic-bezier(0.4,0,0.2,1)",
                                                }}
                                            >
                                                {video.title}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Video card */}
                                    <div
                                        className="p-px bg-linear-to-bl from-gray-700 via-gray-800 to-stone-400 rounded-2xl w-full"
                                        style={{
                                            height: `${height}px`,
                                            transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                                        }}
                                    >
                                        <div
                                            className="w-full h-full rounded-2xl overflow-hidden bg-[#0a0a0a] relative"
                                        >
                                            {video.videoUrl ? (
                                                <video
                                                    src={video.videoUrl}
                                                    className="w-full h-full object-cover"
                                                    loop
                                                    playsInline
                                                    muted
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-linear-to-b from-[#151515] to-[#0a0a0a]" />
                                            )}

                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg
                                                    width={isCenter ? 60 : 44}
                                                    height={isCenter ? 60 : 44}
                                                    viewBox="0 0 56 56"
                                                    fill="none"
                                                    style={{ opacity: 0.5 }}
                                                >
                                                    <polygon points="18,10 48,28 18,46" fill="#999" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Slider - показываем только если видео больше одного */}
                    {videos.length > 1 && (
                        <div className="mt-8 flex items-center gap-4 px-6 sm:px-16 max-w-4xl mx-auto">
                            <div className="relative flex-1 h-0.75 bg-[#333] rounded-full">
                                <input
                                    type="range"
                                    min={0}
                                    max={videos.length - 1}
                                    step={1}
                                    value={activeIndex}
                                    onChange={(e) => setActiveIndex(Number(e.target.value))}
                                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 -top-3"
                                />
                                <div
                                    className="h-full bg-[#555] rounded-full transition-all duration-500"
                                    style={{ width: `${sliderProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Fullscreen video player modal */}
            {playingVideo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
                    onClick={closePlayer}
                >
                    <div
                        className="relative w-full max-w-3xl mx-auto px-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white text-lg font-medium">
                                {playingVideo.title}
                            </h3>
                            <span className="text-white/60 text-sm tabular-nums">
                                {formatTime(currentTime)}/{formatTime(duration)}
                            </span>
                        </div>

                        <div
                            className="relative rounded-2xl overflow-hidden bg-black cursor-pointer"
                            onClick={togglePlay}
                        >
                            <video
                                ref={videoRef}
                                src={playingVideo.videoUrl}
                                className="w-full aspect-square object-contain"
                                autoPlay
                                playsInline
                                onTimeUpdate={() => {
                                    if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
                                }}
                                onLoadedMetadata={() => {
                                    if (videoRef.current) setDuration(videoRef.current.duration)
                                }}
                                onEnded={() => setIsPlaying(false)}
                            />

                            {!isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <svg width="64" height="64" viewBox="0 0 56 56" fill="none">
                                        <polygon points="18,10 48,28 18,46" fill="white" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 relative h-1 bg-white/10 rounded-full">
                            <div
                                className="h-full bg-white/60 rounded-full transition-all duration-200"
                                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
                            />
                            <input
                                type="range"
                                min={0}
                                max={duration || 0}
                                step={0.1}
                                value={currentTime}
                                onChange={(e) => {
                                    const time = Number(e.target.value)
                                    setCurrentTime(time)
                                    if (videoRef.current) videoRef.current.currentTime = time
                                }}
                                className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 -top-2"
                            />
                        </div>

                        {playingVideo.description && (
                            <p className="text-white/50 text-sm mt-4 wrap-break-word">{playingVideo.description}</p>
                        )}

                        <p className="text-center text-white/30 text-xs mt-6">
                            Нажмите Esc или за пределами видео чтобы закрыть
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
