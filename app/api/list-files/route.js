import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

// Define a consistent upload directory path
const UPLOAD_DIR = 'D:/IISER project/website/project/uploads';

export async function GET() {
  try {
    // Read the directory contents
    const files = await readdir(UPLOAD_DIR);
    
    // Get file details
    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filePath = join(UPLOAD_DIR, filename);
        const stats = await stat(filePath);
        
        return {
          name: filename,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          type: filename.split('.').pop().toLowerCase()
        };
      })
    );
    
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
