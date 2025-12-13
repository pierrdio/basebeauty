import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact submissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, message, fileUrl, fileName } = await request.json();
    
    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Name, phone, and message are required' },
        { status: 400 }
      );
    }

    // Phone validation (more flexible for Russian numbers)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone format. Use only digits, spaces, parentheses, and hyphens' },
        { status: 400 }
      );
    }
    
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json(
        { error: 'Phone number must contain 10-11 digits' },
        { status: 400 }
      );
    }

    const newSubmission = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      }
    });
    
    console.log('New contact submission saved:', newSubmission);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Contact submission saved successfully',
      submission: newSubmission
    });
  } catch (error) {
    console.error('Error saving contact submission:', error);
    return NextResponse.json(
      { error: 'Failed to save contact submission' },
      { status: 500 }
    );
  }
}
