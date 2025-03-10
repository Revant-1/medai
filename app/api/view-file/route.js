import { NextResponse } from 'next/server';
import { getDownloadUrl } from '@vercel/blob';

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
    
    try {
      // Get the download URL for the blob
      const blobUrl = await getDownloadUrl(pathname);
      
      if (!blobUrl) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      
      // Redirect to the blob URL (which is publicly accessible)
      return NextResponse.redirect(blobUrl);
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found', details: error.message },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error viewing file:', error);
    return NextResponse.json(
      { error: 'Failed to view file', details: error.message },
      { status: 500 }
    );
  }
}
