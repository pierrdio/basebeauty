import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const works = await prisma.work.findMany({
            orderBy: { id: 'asc' },
        });

        return NextResponse.json(works, { status: 200 });
    } catch (error) {
        void error;
        return NextResponse.json({ error: 'Не удалось загрузить работы' }, { status: 500 });
    }
}