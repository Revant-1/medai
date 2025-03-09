import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

// Define a consistent upload directory path for organization in Vercel Blob
const UPLOAD_PREFIX = 'medisage-uploads';

export async function GET() {
  try {
    // List all blobs with the prefix
    const { blobs } = await list({ prefix: UPLOAD_PREFIX });
    
    // Format the response
    const fileDetails = blobs.map(blob => {
      return {
        name: blob.pathname.split('/').pop(), // Extract just the filename
        path: blob.pathname,
        url: blob.url,
        size: blob.size,
        modified: blob.uploadedAt,
        type: blob.pathname.split('.').pop().toLowerCase()
      };
    });
    
    return NextResponse.json({
      success: true,
      files: fileDetails
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files', details: error.message },
      { status: 500 }
    );
  }
}
