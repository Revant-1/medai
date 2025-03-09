import { NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { join, parse } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Define a consistent upload directory path
const UPLOAD_DIR = 'D:/IISER project/website/project/uploads';

async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw new Error('Failed to create upload directory');
  }
}

// Function to get a unique filename if a file with the same name exists
async function getUniqueFileName(fileName) {
  const dirFiles = await readdir(UPLOAD_DIR);
  const { name, ext } = parse(fileName);
  
  let uniqueName = fileName;
  let counter = 1;

  while (dirFiles.includes(uniqueName)) {
    uniqueName = `${name}(${counter})${ext}`;
    counter++;
  }

  return uniqueName;
}

export async function POST(req) {
  try {
    await ensureUploadDir();
    
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file details
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename to prevent overwriting
    const originalName = file.name;
    const uniqueName = await getUniqueFileName(originalName);
    const filePath = join(UPLOAD_DIR, uniqueName);

    
    // Write the file to disk
    await writeFile(filePath, buffer);
    
    // Return success response with file details
    return NextResponse.json({
      success: true,
      file: {
        originalName,
        name: uniqueName,
        path: filePath,
        size: buffer.length,
        type: file.type
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
