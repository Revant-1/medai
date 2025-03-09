import { NextResponse } from 'next/server';
import { unlink, access } from 'fs/promises';
import { join } from 'path';

// Define a consistent upload directory path
const UPLOAD_DIR = 'D:/IISER project/website/project/uploads';

export async function DELETE(req) {
  try {
    const { filename } = await req.json();
    
    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }
    
    const filePath = join(UPLOAD_DIR, filename);
    
    // Check if file exists before attempting to delete
    try {
      await access(filePath);
    } catch (_error) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Delete the file
    await unlink(filePath);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return NextResponse.json(
      { error: 'Failed to delete file', details: error.message },
      { status: 500 }
    );
  }
} 