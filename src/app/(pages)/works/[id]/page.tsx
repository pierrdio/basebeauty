'use client';

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

type Work = {
    id: number,
    title: string,
    photos: string,
    description?: string
}

type PhotoItem = string | { fileName: string; fileUrl: string }

export default function WorkPage() {
    const [work, setWork] = useState<Work | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const workId = params.id;

    useEffect(() => {
        const fetchWork = async () => {
            try {
                const res = await fetch(`/api/works/${workId}`);
                const data = await res.json();
                setWork(data);
            } catch (error) {
                console.error('Error fetching work:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchWork();
    }, [workId]);

    if (isLoading) {
        return (
            <main className="mx-auto w-full max-w-4xl px-4 py-10">
                <div className="text-center py-20">
                    <p className="text-xl text-gray-600">Загрузка работы...</p>
                </div>
            </main>
        )
    }

    if (!work) {
        return (
            <main className="mx-auto w-full max-w-4xl px-4 py-10">
                <div className="text-center py-20">
                    <p className="text-xl text-gray-600">Работа не найдена</p>
                </div>
            </main>
        )
    }

    // Parse photos JSON
    let photos: PhotoItem[] = [];
    try {
        const parsedPhotos = JSON.parse(work.photos || '[]');
        photos = parsedPhotos;
    } catch (error) {
        console.error('Error parsing photos:', error);
    }

    return (
        <main className="mx-auto flex w-full max-w-7xl px-4 flex-col gap-4 pt-30">
            <div className="rounded-4xl bg-[#111111] p-4 text-white max-w-xl flex-1 mb-10 w-fit">
                <h1 className="text-6xl font-semibold text-[#00D89F]">{work.title}</h1>
            </div>
            
            {photos.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-600">Нет фотографий для этой работы</p>
                </div>
            ) : (
                <section className="py-10">
                    <div className="grid grid-cols-6 grid-rows-8 gap-4 min-h-[900px]">
                        {photos.map((photo, index) => {
                            // Handle both string URLs and objects with fileUrl property
                            let photoUrl = '';
                            if (typeof photo === 'string') {
                                photoUrl = photo;
                            } else if (photo.fileUrl) {
                                photoUrl = photo.fileUrl;
                            }
                            
                            // Skip if no photo
                            if (!photoUrl) return null;
                            
                            // Dynamic grid positioning based on index
                            const positions = [
                                { colSpan: 4, rowSpan: 3, colStart: 1, rowStart: 1 },
                                { colSpan: 2, rowSpan: 2, colStart: 5, rowStart: 1 },
                                { colSpan: 2, rowSpan: 2, colStart: 5, rowStart: 3 },
                                { colSpan: 2, rowSpan: 4, colStart: 5, rowStart: 5 },
                                { colSpan: 4, rowSpan: 3, colStart: 1, rowStart: 4 },
                                { colSpan: 4, rowSpan: 2, colStart: 1, rowStart: 7 },
                                { colSpan: 2, rowSpan: 1, colStart: 5, rowStart: 9 },
                            ];
                            
                            const position = positions[index % positions.length];
                            
                            return (
                                <div 
                                    key={index}
                                    className={`col-span-${position.colSpan} row-span-${position.rowSpan} col-start-${position.colStart} row-start-${position.rowStart}`}
                                >
                                    <div className="group relative h-full w-full overflow-hidden rounded-3xl cursor-pointer transition hover:scale-101">
                                        <img
                                            src={photoUrl}
                                            alt={`${work.title} - фото ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.error('Image load error:', photoUrl);
                                                // Try fallback image
                                                if (photoUrl !== '/img1.webp') {
                                                    e.currentTarget.src = '/img1.webp';
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </main>
    )
}
