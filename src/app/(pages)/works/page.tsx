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
                // Sort by ID descending to show latest works first
                const sortedWorks = data.sort((a: Work, b: Work) => b.id - a.id);
                setWorks(sortedWorks);
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
            <div className="max-w-xl flex-1 mb-10 w-fit p-px bg-linear-to-bl from-gray-500 via-gray-900 to-stone-200 rounded-4xl">
                <div className="bg-black rounded-4xl p-4">
                    <h1 className="text-6xl font-semibold text-[#00D89F] text-center w-full">Все наши работы</h1>
                </div>
            </div>
            
            {isLoading ? (
                <section className="py-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px]">
                        {/* Skeleton items matching the works grid structure */}
                        <div className="lg:col-span-2 lg:row-span-1 relative group overflow-hidden rounded-3xl">
                            <div className="animate-pulse h-full w-full bg-gray-300/20"></div>
                        </div>
                        <div className="lg:col-span-1 lg:row-span-2 relative group overflow-hidden rounded-3xl">
                            <div className="animate-pulse h-full w-full bg-gray-300/20"></div>
                        </div>
                        <div className="lg:col-span-1 lg:row-span-1 relative group overflow-hidden rounded-3xl">
                            <div className="animate-pulse h-full w-full bg-gray-300/20"></div>
                        </div>
                        <div className="lg:col-span-2 lg:row-span-2 relative group overflow-hidden rounded-3xl">
                            <div className="animate-pulse h-full w-full bg-gray-300/20"></div>
                        </div>
                        <div className="lg:col-span-1 lg:row-span-1 relative group overflow-hidden rounded-3xl">
                            <div className="animate-pulse h-full w-full bg-gray-300/20"></div>
                        </div>
                        <div className="lg:col-span-2 lg:row-span-1 relative group overflow-hidden rounded-3xl">
                            <div className="animate-pulse h-full w-full bg-gray-300/20"></div>
                        </div>
                        <div className="lg:col-span-1 lg:row-span-1 relative group overflow-hidden rounded-3xl">
                            <div className="animate-pulse h-full w-full bg-gray-300/20"></div>
                        </div>
                        <div className="lg:col-span-1 lg:row-span-1 relative group overflow-hidden rounded-3xl">
                            <div className="animate-pulse h-full w-full bg-gray-300/20"></div>
                        </div>
                    </div>
                </section>
            ) : works.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-600">Нет работ</p>
                </div>
            ) : (
                <section className="py-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px]">
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
                            
                            // Different patterns for visual variety - wide, tall, square
                            const patterns = [
                                'lg:col-span-2 lg:row-span-1', // Wide horizontal
                                'lg:col-span-1 lg:row-span-2', // Tall vertical  
                                'lg:col-span-1 lg:row-span-1', // Square
                                'lg:col-span-2 lg:row-span-2', // Large square
                                'lg:col-span-1 lg:row-span-1', // Square
                                'lg:col-span-2 lg:row-span-1', // Wide horizontal
                            ];
                            
                            const patternClass = patterns[index % patterns.length];
                            
                            return (
                                <div 
                                    key={work.id}
                                    className={`${patternClass} relative group overflow-hidden rounded-3xl cursor-pointer transition hover:scale-101`}
                                    onClick={() => router.push(`/works/${work.id}`)}
                                >
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
                                    <div className="pointer-events-none absolute rounded-bl-xs rounded-full inset-x-0 bottom-0 backdrop-blur-sm from-black/10 to-transparent px-5 py-1 text-lg font-light text-white bg-linear-to-t w-fit font-onest">
                                        {work.title}
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