'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Work = {
    id: number,
    title: string,
    photos: string,
    description?: string
}

export default function Portfolio() {
    const [works, setWorks] = useState<Work[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchWorks = async () => {
            try {
                const res = await fetch('/api/works');
                const data = await res.json();
                console.log('Portfolio - Raw works data:', data);
                console.log('Portfolio - First work structure:', data[0]);
                // Sort by ID descending to show latest works first
                const sortedWorks = data.sort((a: Work, b: Work) => b.id - a.id);
                setWorks(sortedWorks);
            } catch (error) {
                console.error('Portfolio - Error fetching works:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchWorks();
    }, []);

    // Helper function to get photo URL
    const getPhotoUrl = (work: Work) => {
        console.log(`Portfolio - Getting photo for work ${work.id}:`, work);
        try {
            const photos = JSON.parse(work.photos || '[]');
            console.log(`Portfolio - Parsed photos for work ${work.id}:`, photos);
            if (photos.length > 0) {
                if (typeof photos[0] === 'string') {
                    console.log(`Portfolio - Using string URL:`, photos[0]);
                    return photos[0];
                } else if (photos[0].fileUrl) {
                    console.log(`Portfolio - Using object fileUrl:`, photos[0].fileUrl);
                    return photos[0].fileUrl;
                }
            }
        } catch (error) {
            console.error(`Portfolio - Error parsing photos for work ${work.id}:`, error, 'Raw photos:', work.photos);
        }
        console.log(`Portfolio - Using fallback image for work ${work.id}`);
        return '/img1.webp'; // fallback
    };

    if (isLoading) {
        return (
            <section id="portfolio" className="py-10">
                <div className="grid grid-cols-6 grid-rows-8 gap-4 min-h-[900px]">
                    {/* Skeleton items matching the grid structure */}
                    <div className="col-span-4 row-span-3 col-start-1 row-start-1">
                        <div className="animate-pulse h-full w-full bg-gray-300 rounded-3xl"></div>
                    </div>
                    <div className="col-span-2 row-span-2 col-start-5 row-start-1">
                        <div className="animate-pulse h-full w-full bg-gray-300 rounded-3xl"></div>
                    </div>
                    <div className="col-span-2 row-span-2 col-start-5 row-start-3">
                        <div className="animate-pulse h-full w-full bg-gray-300 rounded-3xl"></div>
                    </div>
                    <div className="col-span-2 row-span-4 col-start-5 row-start-5">
                        <div className="animate-pulse h-full w-full bg-gray-300 rounded-3xl"></div>
                    </div>
                    <div className="col-span-2 row-span-2 col-start-1 row-start-4">
                        <div className="animate-pulse h-full w-full bg-gray-300 rounded-3xl"></div>
                    </div>
                    <div className="col-span-2 row-span-2 col-start-3 row-start-4">
                        <div className="animate-pulse h-full w-full bg-gray-300 rounded-3xl"></div>
                    </div>
                    <div className="col-span-4 row-span-3 col-start-1 row-start-6">
                        <div className="animate-pulse h-full w-full bg-gray-300 rounded-3xl"></div>
                    </div>
                </div>
            </section>
        );
    }

    // Use real works if available, otherwise fallback
    const displayWorks = works.length > 0 ? works : [
        { id: 1, title: "Работа 1", photos: '["/img1.webp"]' },
        { id: 2, title: "Работа 2", photos: '["/img1.webp"]' },
        { id: 3, title: "Работа 3", photos: '["/img1.webp"]' },
        { id: 4, title: "Работа 4", photos: '["/img1.webp"]' },
        { id: 5, title: "Работа 5", photos: '["/img1.webp"]' },
        { id: 6, title: "Работа 6", photos: '["/img1.webp"]' },
        { id: 7, title: "Работа 7", photos: '["/img1.webp"]' }
    ];

    return (
        <section id="portfolio" className="py-10">
            <div className="grid grid-cols-6 grid-rows-8 gap-4 min-h-[900px]">
                {displayWorks.slice(0, 7).map((work, index) => {
                    // Define grid positions for up to 7 items
                    const positions = [
                        { colSpan: 4, rowSpan: 3, colStart: 1, rowStart: 1 }, // Item 1
                        { colSpan: 2, rowSpan: 2, colStart: 5, rowStart: 1 }, // Item 2
                        { colSpan: 2, rowSpan: 2, colStart: 5, rowStart: 3 }, // Item 3
                        { colSpan: 2, rowSpan: 4, colStart: 5, rowStart: 5 }, // Item 4
                        { colSpan: 2, rowSpan: 2, colStart: 1, rowStart: 4 }, // Item 5
                        { colSpan: 2, rowSpan: 2, colStart: 3, rowStart: 4 }, // Item 6
                        { colSpan: 4, rowSpan: 3, colStart: 1, rowStart: 6 }, // Item 7
                    ];
                    
                    const position = positions[index];
                    if (!position) return null;
                    
                    return (
                        <div 
                            key={work.id}
                            className={`col-span-${position.colSpan} row-span-${position.rowSpan} col-start-${position.colStart} row-start-${position.rowStart}`}
                        >
                            <div className="p-px bg-linear-to-tl from-gray-500 via-gray-900 to-stone-200 rounded-3xl h-full w-full">
                                <div 
                                    className="group relative h-full w-full overflow-hidden rounded-3xl cursor-pointer transition hover:scale-101"
                                    onClick={() => router.push(`/works/${work.id}`)}
                                >
                                <Image
                                    src={getPhotoUrl(work)}
                                    alt={work.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="pointer-events-none absolute rounded-bl-xs rounded-full inset-x-0 bottom-0 backdrop-blur-sm from-black/10 to-transparent px-5 py-1 text-lg font-light text-white bg-linear-to-t w-fit">
                                    {work.title}
                                </div>
                            </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
