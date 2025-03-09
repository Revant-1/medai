import { NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import { lookup } from 'mime-types';

// Define a consistent upload directory path
const UPLOAD_DIR = 'D:/IISER project/website/project/uploads';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const filename = url.searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }
    
    const filePath = join(UPLOAD_DIR, filename);
    
    // Check if file exists
    try {
      await access(filePath);
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Determine the MIME type
    const mimeType = lookup(filename) || 'application/octet-stream';
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error viewing file:', error);
    return NextResponse.json(
      { error: 'Failed to view file', details: error.message },
      { status: 500 }
    );
  }
} 