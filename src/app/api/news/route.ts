import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const news = await prisma.news.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(news, { status: 200 });
    } catch (error) {
        void error;
        return NextResponse.json(
            { error: "Не удалось загрузить новости" },
            { status: 500 }
        );
    }
}
