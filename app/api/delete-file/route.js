import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

// Define a consistent upload directory path for organization in Vercel Blob
const UPLOAD_PREFIX = 'medisage-uploads';

export async function DELETE(req) {
  try {
    const { pathname } = await req.json();
    
    if (!pathname) {
      return NextResponse.json(
        { error: 'No file pathname provided' },
        { status: 400 }
      );
    }
    
    // Delete the blob
    await del(pathname);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file', details: error.message },
      { status: 500 }
    );
  }
} 