import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(_: any, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Check if work exists
    const work = await prisma.work.findUnique({
      where: { id }
    });
    
    if (!work) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    await prisma.work.delete({
      where: { id }
    }); 
    
    return NextResponse.json({ success: true, message: 'Work deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete work',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}