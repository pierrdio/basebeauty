import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { extname, join } from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const title = String(formData.get('title') || '');
        const description = String(formData.get('description') || '');
        const video = formData.get('video') as File;

        if (!title.trim()) {
            return NextResponse.json({ error: 'Название обязательно' }, { status: 400 });
        }

        if (!video) {
            return NextResponse.json({ error: 'Видео файл обязателен' }, { status: 400 });
        }

        const uploadsRoot = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
        const uploadDir = join(uploadsRoot, 'videos');
        await mkdir(uploadDir, { recursive: true });

        // Validate video file
        const ext = extname(video.name).toLowerCase();
        // Allow common video formats
        if (!['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'].includes(ext)) {
            return NextResponse.json({ error: 'Разрешены только видео файлы (MP4, AVI, MOV, WMV, FLV, WebM, MKV)' }, { status: 400 });
        }

        const randomFileName = randomBytes(12).toString('hex') + ext;
        const filePath = join(uploadDir, randomFileName);
        const bytes = await video.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        const videoUrl = `/api/uploads/videos/${randomFileName}`;

        // Store video in DB
        const newVideo = await prisma.video.create({
            data: {
                title,
                description,
                videoUrl,
            },
        });

        return NextResponse.json({
            success: true,
            video: newVideo
        }, { status: 201 });
    } catch (error) {
        console.error('Ошибка при создании видео:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
