import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const videos = await prisma.video.findMany({
            orderBy: { id: 'asc' },
        });

        return NextResponse.json(videos, { status: 200 });
    } catch (error) {
        console.error('Ошибка в API /videos:', error);
        return NextResponse.json({ error: 'Не удалось загрузить видео' }, { status: 500 });
    }
}
