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

    // Check if work exists
    const existingWork = await prisma.work.findUnique({
      where: { id }
    });
    
    if (!existingWork) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    let photos = existingWork.photos; // Keep existing photos by default
    
    // Handle new photo uploads if any
    const photoFiles = formData.getAll('photo') as File[];
    if (photoFiles.length > 0) {
      const uploadDir = join(process.cwd(), 'uploads', 'works');
      await mkdir(uploadDir, { recursive: true });
      
      const savedFiles = [];
      
      for (const file of photoFiles) {
        if (file.size === 0) continue;
        
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
          continue; // Skip invalid files
        }
        
        const randomFileName = randomBytes(12).toString('hex') + ext;
        const filePath = join(uploadDir, randomFileName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Removed size limit - no file size restrictions
        
        await writeFile(filePath, buffer);
        savedFiles.push({ fileName: file.name, fileUrl: `/api/uploads/works/${randomFileName}` });
      }
      
      // If new photos uploaded, replace existing ones
      if (savedFiles.length > 0) {
        photos = JSON.stringify(savedFiles);
      }
    }

    // Update the work
    const updatedWork = await prisma.work.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        photos
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Work updated successfully',
      work: updatedWork
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update work',
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
    console.log('DELETE - Raw params:', resolvedParams);
    const id = Number(resolvedParams.id);
    console.log('DELETE - Converted ID:', id, 'Type:', typeof id);
    
    if (isNaN(id)) {
      console.log('DELETE - Invalid ID:', resolvedParams.id);
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Check if work exists
    const existingWork = await prisma.work.findUnique({
      where: { id }
    });
    
    console.log('DELETE - Existing work:', existingWork);
    
    if (!existingWork) {
      console.log('DELETE - Work not found for ID:', id);
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    // Delete the work
    await prisma.work.delete({
      where: { id }
    });

    console.log('DELETE - Successfully deleted work:', id);
    return NextResponse.json({ 
      success: true, 
      message: 'Work deleted successfully'
    });
  } catch (error) {
    console.error('Delete work error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete work',
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

    const work = await prisma.work.findUnique({
      where: { id }
    });
    
    if (!work) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    return NextResponse.json(work);
  } catch (error) {
    console.error('Get work error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch work',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
