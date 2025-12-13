import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const works = await prisma.work.findMany();
    
    for (const work of works) {
      if (work.photos) {
        const photos = JSON.parse(work.photos);
        const updatedPhotos = photos.map((photo: any) => ({
          ...photo,
          fileUrl: photo.fileUrl.replace('/uploads/works/', '/api/uploads/works/')
        }));
        
        await prisma.work.update({
          where: { id: work.id },
          data: { photos: JSON.stringify(updatedPhotos) }
        });
      }
    }
    
    return NextResponse.json({ success: true, message: 'Paths updated successfully' });
  } catch (error) {
    console.error('Error updating paths:', error);
    return NextResponse.json({ error: 'Failed to update paths' }, { status: 500 });
  }
}
