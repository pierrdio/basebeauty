'use client';

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { SimplePhotoPreview } from "@/components/ui/simple-photo-preview"

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
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
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

    // Convert photos to format expected by PhotoPreview
    const previewPhotos = photos.map((photo, index) => {
        if (typeof photo === 'string') {
            return {
                fileName: `${work.title} - фото ${index + 1}`,
                fileUrl: photo
            };
        } else {
            return photo;
        }
    });

    const openPreview = (index: number) => {
        setPreviewIndex(index);
        setIsPreviewOpen(true);
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
    };

    return (
        <main className="mx-auto flex w-full max-w-7xl px-4 flex-col gap-4 pt-30">
            <div className="w-fit max-w-lg mb-10 max-sm:mx-auto p-px bg-linear-to-bl from-gray-500 via-gray-900 to-stone-200 rounded-4xl">
                <div className="bg-black rounded-4xl px-6 py-4">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-[#00D89F] text-center break-all">{work.title}</h1>
                </div>
            </div>
            
            {photos.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-600">Нет фотографий для этой работы</p>
                </div>
            ) : (
                <section className="py-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px]">
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
                            
                            // Different patterns for visual variety - unique patterns for individual work page
                            const patterns = [
                                { grid: 'lg:col-span-3 lg:row-span-2', ratio: 16/9 }, // Large horizontal (main photo)
                                { grid: 'lg:col-span-1 lg:row-span-1', ratio: 1 }, // Small square
                                { grid: 'lg:col-span-1 lg:row-span-1', ratio: 1 }, // Small square
                                { grid: 'lg:col-span-2 lg:row-span-2', ratio: 1 }, // Medium square
                                { grid: 'lg:col-span-1 lg:row-span-2', ratio: 2/3 }, // Tall vertical
                                { grid: 'lg:col-span-2 lg:row-span-1', ratio: 16/9 }, // Wide horizontal
                                { grid: 'lg:col-span-1 lg:row-span-1', ratio: 1 }, // Small square
                                { grid: 'lg:col-span-1 lg:row-span-1', ratio: 1 }, // Small square
                            ];
                            
                            const pattern = patterns[index % patterns.length];
                            
                            return (
                                <div 
                                    key={index}
                                    className={`${pattern.grid} relative group overflow-hidden rounded-3xl cursor-pointer transition hover:scale-101`}
                                    onClick={() => openPreview(index)}
                                >
                                    <AspectRatio ratio={pattern.ratio} className="w-full h-full">
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
                                    </AspectRatio>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
            
            {/* Simple Photo Preview Modal */}
            <SimplePhotoPreview 
                photos={previewPhotos}
                initialIndex={previewIndex}
                isOpen={isPreviewOpen}
                onClose={closePreview}
            />
        </main>
    )
}
