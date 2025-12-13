import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    if (!status || typeof status !== 'string') {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status values
    const validStatuses = ['new', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: new, in_progress, completed' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existingSubmission = await prisma.contactSubmission.findUnique({
      where: { id }
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      );
    }

    // Update status
    const updatedSubmission = await prisma.contactSubmission.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    console.log(`Contact submission ${id} status updated to: ${status}`);

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      submission: updatedSubmission
    });

  } catch (error) {
    console.error('Error updating contact submission status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
