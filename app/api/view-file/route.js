import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const pathname = url.searchParams.get('pathname');
    
    if (!pathname) {
      return NextResponse.json(
        { error: 'No file pathname provided' },
        { status: 400 }
      );
    }
    
    // Get the blob
    const blob = await get(pathname);
    
    if (!blob) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Redirect to the blob URL (which is publicly accessible)
    return NextResponse.redirect(blob.url);
  } catch (error) {
    console.error('Error viewing file:', error);
    return NextResponse.json(
      { error: 'Failed to view file', details: error.message },
      { status: 500 }
    );
  }
} 