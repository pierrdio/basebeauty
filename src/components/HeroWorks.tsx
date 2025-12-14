'use client';

import { AspectRatio } from "./ui/aspect-ratio";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Work = {
    id: number,
    title: string,
    photos: string,
    description?: string
}

export default function HeroWorks() {
    const [works, setWorks] = useState<Work[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchWorks = async () => {
            try {
                const res = await fetch('/api/works');
                const data = await res.json();
                // Get last 3 works (most recent)
                const lastWorks = data.slice(-3).reverse();
                setWorks(lastWorks);
            } catch (error) {
                console.error('Error fetching works:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchWorks();
    }, []);

    // Helper function to get photo URL
    const getPhotoUrl = (work: Work) => {
        try {
            const photos = JSON.parse(work.photos || '[]');
            if (photos.length > 0) {
                if (typeof photos[0] === 'string') {
                    return photos[0];
                } else if (photos[0].fileUrl) {
                    return photos[0].fileUrl;
                }
            }
        } catch (error) {
            console.error('Error parsing photos:', error);
        }
        return '/img1.webp'; // fallback
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 w-full">
                <div className="animate-pulse">
                    <div className="w-full h-64 sm:h-80 bg-gray-300 rounded-2xl sm:rounded-3xl"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="animate-pulse">
                        <div className="w-full h-full min-h-[200px] bg-gray-300 rounded-2xl sm:rounded-3xl"></div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="animate-pulse">
                            <div className="w-full h-48 sm:h-56 bg-gray-300 rounded-2xl sm:rounded-3xl"></div>
                        </div>
                        <div className="animate-pulse">
                            <div className="w-full h-12 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Use real works if available, otherwise show fallback
    const displayWorks = works.length > 0 ? works : [
        { id: 1, title: "Работа 1", photos: '["/img1.webp"]' },
        { id: 2, title: "Работа 2", photos: '["/img1.webp"]' },
        { id: 3, title: "Работа 3", photos: '["/img1.webp"]' }
    ];

    return (
        <div className="flex flex-col gap-7 w-full">
            {/* Верхнее большое изображение - последняя работа */}
            {displayWorks[0] && (
                <div className="p-px bg-linear-to-tl from-gray-500 via-gray-900 to-stone-200 rounded-2xl sm:rounded-3xl">
                    <div 
                        className="relative w-full h-64 sm:h-80 overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer transition hover:scale-101"
                        onClick={() => router.push(`/works/${displayWorks[0].id}`)}
                    >
                    <Image
                            src={getPhotoUrl(displayWorks[0])}
                            alt={displayWorks[0].title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="pointer-events-none absolute rounded-bl-xs rounded-full inset-x-0 bottom-0 backdrop-blur-sm from-black/10 to-transparent px-5 py-1 text-lg font-light text-white bg-linear-to-t w-fit">
                            {displayWorks[0].title}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Нижняя часть - изображения и кнопка */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Левое изображение - вторая работа */}
                {displayWorks[1] && (
                    <div className="p-px bg-linear-to-tl from-gray-500 via-gray-900 to-stone-200 rounded-2xl sm:rounded-3xl">
                        <div 
                            className="relative w-full h-full sm:h-full min-h-50 overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer transition hover:scale-101"
                            onClick={() => router.push(`/works/${displayWorks[1].id}`)}
                        >
                            <Image
                                src={getPhotoUrl(displayWorks[1])}
                                alt={displayWorks[1].title}
                                fill
                                className="object-cover"
                            />
                            <div className="pointer-events-none absolute rounded-bl-xs rounded-full inset-x-0 bottom-0 backdrop-blur-sm from-black/10 to-transparent px-5 py-1 text-lg font-light text-white bg-linear-to-t w-fit">
                                {displayWorks[1].title}
                            </div>
                        </div>
                    </div>
                )}

                {/* Правая часть - изображение и кнопка */}
                <div className="flex flex-col gap-4 h-full">
                    {/* Правое изображение - третья работа */}
                    {displayWorks[2] ? (
                        <div className="p-px bg-linear-to-tl from-gray-500 via-gray-900 to-stone-200 rounded-2xl sm:rounded-3xl">
                            <div 
                                className="relative w-full h-48 sm:h-56 overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer transition hover:scale-101"
                                onClick={() => router.push(`/works/${displayWorks[2].id}`)}
                            >
                                <Image
                                    src={getPhotoUrl(displayWorks[2])}
                                    alt={displayWorks[2].title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="pointer-events-none absolute rounded-bl-xs rounded-full inset-x-0 bottom-0 backdrop-blur-sm from-black/10 to-transparent px-5 py-1 text-lg font-light text-white bg-linear-to-t w-fit">
                                    {displayWorks[2].title}
                                </div>
                            </div>
                        </div>
                    ) : displayWorks[1] ? (
                        // Если нет третьей работы, но есть вторая, покажем её снова
                        <div className="p-px bg-linear-to-tl from-gray-500 via-gray-900 to-stone-200 rounded-2xl sm:rounded-3xl">
                            <div 
                                className="relative w-full h-48 sm:h-56 overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer transition hover:scale-101"
                                onClick={() => router.push(`/works/${displayWorks[1].id}`)}
                            >
                                <Image
                                    src={getPhotoUrl(displayWorks[1])}
                                    alt={displayWorks[1].title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="pointer-events-none absolute rounded-bl-xs rounded-full inset-x-0 bottom-0 backdrop-blur-sm from-black/10 to-transparent px-5 py-1 text-lg font-light text-white bg-linear-to-t w-fit">
                                    {displayWorks[1].title}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Если нет и второй работы, покажем заглушку
                        <div className="p-px bg-linear-to-tl from-gray-500 via-gray-900 to-stone-200 rounded-2xl sm:rounded-3xl">
                            <div className="relative w-full h-48 sm:h-56 overflow-hidden rounded-2xl sm:rounded-3xl">
                                <Image
                                    src="/img1.webp"
                                    alt="Заполнитель"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Кнопка */}
                    <Link href="/works" className="w-full rounded-full border-2 border-[#00D89F] py-3 text-center text-lg sm:text-xl font-semibold text-white hover:bg-[#00D89F] hover:text-black transition-colors">
                        Ещё работы
                    </Link>
                </div>
            </div>
        </div>
    );
}
