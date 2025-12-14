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
        const photo = formData.getAll('photo') as File[];

        const uploadsRoot = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
        const uploadDir = join(uploadsRoot, 'works');
        await mkdir(uploadDir, { recursive: true });
        await mkdir(uploadDir, { recursive: true });

        const savedFiles: Array<{ fileName: string; fileUrl: string }> = [];

        for (const f of photo) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!f || typeof (f as any).arrayBuffer !== 'function') continue;
            const file = f as File;
            const ext = extname(file.name).toLowerCase();
            // basic validation: only allow image files
            if (!['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
                return NextResponse.json({ error: 'Разрешены только изображения (JPG, PNG, GIF, WebP, SVG)' }, { status: 400 });
            }
            const randomFileName = randomBytes(12).toString('hex') + ext;
            const filePath = join(uploadDir, randomFileName);
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            // Removed size limit - no file size restrictions
            await writeFile(filePath, buffer);
            savedFiles.push({ fileName: file.name, fileUrl: `/api/uploads/works/${randomFileName}` });
        }

        // store work in DB; photos stored as JSON string
        const work = await prisma.work.create({
            data: {
                title,
                description,
                photos: JSON.stringify(savedFiles),
            },
        });

        return NextResponse.json({ 
            success: true, 
            work: { 
                ...work, 
                photos: savedFiles 
            } 
        }, { status: 201 });
    } catch (error) {
        console.error('Ошибка при создании работы:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}