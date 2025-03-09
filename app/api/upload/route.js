import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'path';

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Define a consistent upload directory path for organization in Vercel Blob
const UPLOAD_PREFIX = 'medisage-uploads';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file details
    const originalName = file.name;
    const { name: baseName, ext } = parse(originalName);
    
    // Create a unique filename to prevent overwriting
    const uniqueName = `${UPLOAD_PREFIX}/${baseName}-${uuidv4()}${ext}`;
    
    // Upload to Vercel Blob
    const blob = await put(uniqueName, file, {
      access: 'public', // Make the file publicly accessible
    });
    
    // Return success response with file details
    return NextResponse.json({
      success: true,
      file: {
        originalName,
        name: blob.pathname.split('/').pop(), // Extract just the filename
        url: blob.url,
        size: blob.size,
        type: file.type,
        pathname: blob.pathname
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    );
  }
}
