import { readFile } from "fs/promises";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const resolvedParams = await params;
        const path = resolvedParams.path.join("/");
        const filePath = join(process.cwd(), "uploads", "news", path);

        const fileBuffer = await readFile(filePath);

        const ext = path.split(".").pop()?.toLowerCase();
        let contentType = "application/octet-stream";

        switch (ext) {
            case "jpg":
            case "jpeg":
                contentType = "image/jpeg";
                break;
            case "png":
                contentType = "image/png";
                break;
            case "mp4":
                contentType = "video/mp4";
                break;
            case "webm":
                contentType = "video/webm";
                break;
        }

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000",
            },
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}
