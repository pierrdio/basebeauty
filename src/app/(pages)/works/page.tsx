'use client';

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Work = {
    id: number,
    title: string,
    photos: string, // JSON string array of photo URLs
    description?: string
}

export default function Works() {
    const [works, setWorks] = useState<Work[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchWorks = async () => {
            try {
                const res = await fetch('/api/works');
                const data = await res.json();
                console.log('Raw works data:', data);
                console.log('First work structure:', data[0]);
                setWorks(data);
            } catch (error) {
                console.error('Error fetching works:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchWorks();
    }, [])

    return (
        <main className="mx-auto flex w-full max-w-7xl px-4 flex-col gap-4 pt-30">
            <div className="rounded-4xl bg-[#111111] p-4 text-white max-w-xl flex-1 mb-10 w-fit">
                <h1 className="text-6xl font-semibold text-[#00D89F]">Все наши работы</h1>
            </div>
            
            {isLoading ? (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-600">Загрузка работ...</p>
                </div>
            ) : works.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-600">Нет работ</p>
                </div>
            ) : (
                <section className="py-10">
                    <div className="grid grid-cols-6 grid-rows-8 gap-4 min-h-[900px]">
                        {works.map((work, index) => {
                            // Parse photos JSON and get first photo
                            let photoUrl = '';
                            console.log(`Work ${index}:`, work);
                            console.log(`Photos field:`, work.photos);
                            
                            try {
                                const photos = JSON.parse(work.photos || '[]');
                                console.log(`Parsed photos:`, photos);
                                
                                // Handle both string URLs and objects with fileUrl property
                                if (photos.length > 0) {
                                    if (typeof photos[0] === 'string') {
                                        photoUrl = photos[0];
                                    } else if (photos[0].fileUrl) {
                                        photoUrl = photos[0].fileUrl;
                                    }
                                }
                                
                                console.log(`Selected photo URL:`, photoUrl);
                                
                                // Fix URL if needed - add base URL for relative paths
                                if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http') && !photoUrl.startsWith('/')) {
                                    photoUrl = `/uploads/works/${photoUrl}`;
                                    console.log(`Fixed photo URL:`, photoUrl);
                                }
                            } catch (error) {
                                console.error('Error parsing photos:', error, 'Raw photos:', work.photos);
                            }
                            
                            // Skip if no photo
                            if (!photoUrl) {
                                console.log(`Skipping work ${work.id} - no photo URL`);
                                return null;
                            }
                            
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
                                    key={work.id}
                                    className={`col-span-${position.colSpan} row-span-${position.rowSpan} col-start-${position.colStart} row-start-${position.rowStart}`}
                                    onClick={() => router.push(`/works/${work.id}`)}
                                >
                                    <div className="group relative h-full w-full overflow-hidden rounded-3xl cursor-pointer transition hover:scale-101">
                                        <img
                                            src={photoUrl}
                                            alt={work.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.error('Image load error:', photoUrl, 'Full error:', e);
                                                // Try fallback image
                                                if (typeof photoUrl === 'string' && photoUrl !== '/img1.webp') {
                                                    e.currentTarget.src = '/img1.webp';
                                                } else {
                                                    e.currentTarget.style.display = 'none';
                                                }
                                            }}
                                            onLoad={() => {
                                                console.log('Image loaded successfully:', photoUrl);
                                            }}
                                        />
                                        <div className="pointer-events-none absolute rounded-bl-xs rounded-full inset-x-0 bottom-0 backdrop-blur-sm from-black/10 to-transparent px-5 py-1 text-lg font-light text-white bg-linear-to-t w-fit">
                                            {work.title}
                                        </div>
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