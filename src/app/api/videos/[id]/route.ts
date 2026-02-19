import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { randomBytes } from 'crypto';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    });

    if (!existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    let videoUrl = existingVideo.videoUrl; // Keep existing video by default

    // Handle new video upload if any
    const videoFile = formData.get('video') as File;
    if (videoFile && videoFile.size > 0) {
      const uploadDir = join(process.cwd(), 'uploads', 'videos');
      await mkdir(uploadDir, { recursive: true });

      const ext = '.' + videoFile.name.split('.').pop()?.toLowerCase();
      if (!['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'].includes(ext)) {
        return NextResponse.json({ error: 'Invalid video format' }, { status: 400 });
      }

      const randomFileName = randomBytes(12).toString('hex') + ext;
      const filePath = join(uploadDir, randomFileName);
      const bytes = await videoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await writeFile(filePath, buffer);
      videoUrl = `/api/uploads/videos/${randomFileName}`;
    }

    // Update the video
    const updatedVideo = await prisma.video.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        videoUrl
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully',
      video: updatedVideo
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({
      error: 'Failed to update video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    });

    if (!existingVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Delete the video
    await prisma.video.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    return NextResponse.json({
      error: 'Failed to delete video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Get video error:', error);
    return NextResponse.json({
      error: 'Failed to fetch video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
