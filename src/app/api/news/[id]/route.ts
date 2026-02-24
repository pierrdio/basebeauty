import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import { randomBytes } from "crypto";
import { extname } from "path";

const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png"];
const ALLOWED_VIDEO_EXTS = [".mp4", ".webm"];
const MAX_IMAGE_SIZE = 30 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

async function uploadFile(file: File, uploadDir: string): Promise<string> {
    await mkdir(uploadDir, { recursive: true });
    const ext = extname(file.name).toLowerCase();
    const randomFileName = randomBytes(12).toString("hex") + ext;
    const filePath = join(uploadDir, randomFileName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));
    return `/api/uploads/news/${randomFileName}`;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = Number(resolvedParams.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const news = await prisma.news.findUnique({ where: { id } });

        if (!news) {
            return NextResponse.json({ error: "News not found" }, { status: 404 });
        }

        return NextResponse.json(news);
    } catch (error) {
        console.error("Get news error:", error);
        return NextResponse.json(
            { error: "Failed to fetch news" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = Number(resolvedParams.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const existing = await prisma.news.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "News not found" }, { status: 404 });
        }

        const formData = await request.formData();
        const title = formData.get("title") as string;
        const blocksRaw = formData.get("blocks") as string;
        const cover = formData.get("cover") as File | null;

        if (!title?.trim()) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const uploadsRoot = process.env.UPLOADS_DIR || join(process.cwd(), "uploads");
        const uploadDir = join(uploadsRoot, "news");

        let coverUrl = existing.cover;

        if (cover && typeof cover.arrayBuffer === "function" && cover.size > 0) {
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
        let blocks = JSON.parse(blocksRaw || existing.blocks);
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
                // Keep existing carousel URLs from block content
                let existingUrls: string[] = [];
                try {
                    const parsed = JSON.parse(block.content || "[]");
                    existingUrls = parsed.filter((url: string) => typeof url === "string" && url.startsWith("/api/uploads/"));
                } catch {}

                // Process new carousel images
                const newImages: string[] = [];
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
                    newImages.push(imageUrl);
                    imageIndex++;
                }

                block.content = JSON.stringify([...existingUrls, ...newImages]);
            }
        }

        const updated = await prisma.news.update({
            where: { id },
            data: {
                title: title.trim(),
                blocks: JSON.stringify(blocks),
                cover: coverUrl,
            },
        });

        return NextResponse.json({ success: true, news: updated });
    } catch (error) {
        console.error("Update news error:", error);
        return NextResponse.json(
            { error: "Failed to update news" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = Number(resolvedParams.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const existing = await prisma.news.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "News not found" }, { status: 404 });
        }

        await prisma.news.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "News deleted successfully" });
    } catch (error) {
        console.error("Delete news error:", error);
        return NextResponse.json(
            { error: "Failed to delete news" },
            { status: 500 }
        );
    }
}
