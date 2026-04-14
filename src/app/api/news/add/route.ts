import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { extname, join } from "path";

const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png"];
const ALLOWED_VIDEO_EXTS = [".mp4", ".webm", ".mov"];
const MAX_IMAGE_SIZE = 30 * 1024 * 1024; // 30 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

async function uploadFile(file: File, uploadDir: string): Promise<string> {
    await mkdir(uploadDir, { recursive: true });
    const ext = extname(file.name).toLowerCase();
    const randomFileName = randomBytes(12).toString("hex") + ext;
    const filePath = join(uploadDir, randomFileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));
    return `/api/uploads/news/${randomFileName}`;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const title = String(formData.get("title") || "");
        const blocksRaw = String(formData.get("blocks") || "[]");
        const cover = formData.get("cover") as File | null;

        if (!title.trim()) {
            return NextResponse.json(
                { error: "Название обязательно" },
                { status: 400 }
            );
        }

        const uploadsRoot = process.env.UPLOADS_DIR || join(process.cwd(), "uploads");
        const uploadDir = join(uploadsRoot, "news");

        let coverUrl: string | null = null;

        if (cover && typeof cover.arrayBuffer === "function") {
            const ext = extname(cover.name).toLowerCase();
            const isImage = ALLOWED_IMAGE_EXTS.includes(ext);
            const isVideo = ALLOWED_VIDEO_EXTS.includes(ext);

            if (!isImage && !isVideo) {
                return NextResponse.json(
                    { error: "Разрешены только изображения (JPG, JPEG, PNG) и видео (MP4, WebM)" },
                    { status: 400 }
                );
            }

            const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
            if (cover.size > maxSize) {
                return NextResponse.json(
                    { error: `Файл слишком большой. Максимум ${isVideo ? "50" : "30"} Мб` },
                    { status: 400 }
                );
            }

            coverUrl = await uploadFile(cover, uploadDir);
        }

        // Process block images and carousel images
        let blocks = JSON.parse(blocksRaw);
        for (const block of blocks) {
            if (block.type === "image") {
                const blockFile = formData.get(`block-image-${block.id}`) as File | null;
                if (blockFile && typeof blockFile.arrayBuffer === "function") {
                    const ext = extname(blockFile.name).toLowerCase();
                    if (!ALLOWED_IMAGE_EXTS.includes(ext)) continue;
                    if (blockFile.size > MAX_IMAGE_SIZE) continue;
                    block.content = await uploadFile(blockFile, uploadDir);
                }
            } else if (block.type === "carousel") {
                // Process carousel images - collect all files for this block
                const carouselImages: string[] = [];
                let imageIndex = 0;
                while (true) {
                    const carouselFile = formData.get(`carousel-image-${block.id}-${imageIndex}`) as File | null;
                    if (!carouselFile || typeof carouselFile.arrayBuffer !== "function") break;

                    const ext = extname(carouselFile.name).toLowerCase();
                    if (!ALLOWED_IMAGE_EXTS.includes(ext)) {
                        imageIndex++;
                        continue;
                    }
                    if (carouselFile.size > MAX_IMAGE_SIZE) {
                        imageIndex++;
                        continue;
                    }

                    const imageUrl = await uploadFile(carouselFile, uploadDir);
                    carouselImages.push(imageUrl);
                    imageIndex++;
                }

                // Store carousel images as JSON array
                block.content = JSON.stringify(carouselImages);
            }
        }

        const news = await prisma.news.create({
            data: {
                title,
                cover: coverUrl,
                blocks: JSON.stringify(blocks),
            },
        });

        return NextResponse.json(
            { success: true, news },
            { status: 201 }
        );
    } catch (error) {
        console.error("Ошибка при создании новости:", error);
        return NextResponse.json(
            { error: "Ошибка сервера" },
            { status: 500 }
        );
    }
}
