import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const filePath = join(process.cwd(), 'uploads', 'videos', path);

    // Read the file
    const fileBuffer = await readFile(filePath);

    // Determine content type based on file extension
    const ext = path.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case 'mp4':
        contentType = 'video/mp4';
        break;
      case 'avi':
        contentType = 'video/x-msvideo';
        break;
      case 'mov':
        contentType = 'video/quicktime';
        break;
      case 'wmv':
        contentType = 'video/x-ms-wmv';
        break;
      case 'flv':
        contentType = 'video/x-flv';
        break;
      case 'webm':
        contentType = 'video/webm';
        break;
      case 'mkv':
        contentType = 'video/x-matroska';
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error serving video file:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
