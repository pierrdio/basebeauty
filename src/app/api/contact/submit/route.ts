import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File;

    // Validate required fields
    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json({ 
        error: 'Name, phone, and message are required' 
      }, { status: 400 });
    }

    // Validate phone format (more flexible for Russian numbers)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ 
        error: 'Invalid phone format. Use only digits, spaces, parentheses, and hyphens' 
      }, { status: 400 });
    }
    
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json({ 
        error: 'Phone number must contain 10-11 digits' 
      }, { status: 400 });
    }

    let fileUrl = '';
    let fileName = '';
    
    // Handle file upload if present
    if (file && file.size > 0) {
      const uploadDir = join(process.cwd(), 'uploads', 'projects');
      await mkdir(uploadDir, { recursive: true });
      
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.doc', '.docx', '.zip', '.rar'];
      
      if (!allowedExtensions.includes(ext)) {
        return NextResponse.json({ 
          error: 'Invalid file type. Allowed: images, PDF, DOC, ZIP' 
        }, { status: 400 });
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        return NextResponse.json({ 
          error: 'File size too large. Maximum 50MB' 
        }, { status: 400 });
      }
      
      const randomFileName = randomBytes(12).toString('hex') + ext;
      const filePath = join(uploadDir, randomFileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);
      fileUrl = `/api/uploads/projects/${randomFileName}`;
      fileName = file.name;
    }

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      }
    });

    console.log('Project submission saved to database:', submission);

    return NextResponse.json({ 
      success: true, 
      message: 'Project submitted successfully',
      submission
    });
    
  } catch (error) {
    console.error('Project submission error:', error);
    return NextResponse.json({ 
      error: 'Failed to submit project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
