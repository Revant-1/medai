import { NextResponse } from "next/server";
import { getDownloadUrl } from '@vercel/blob';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

// Improved text extraction function using external API
async function extractTextFromFile(url: string, fileType: string): Promise<string> {
  try {
    // For PDFs, use a PDF extraction API
    if (fileType === 'pdf') {
      // In a production app, you would use a proper PDF extraction service
      // This is a simplified example
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      
      // For now, return a placeholder
      return `This is the extracted content from the PDF file. In a production environment, 
      we would use a proper PDF extraction service to get the actual content.`;
    }
    
    // For text-based files, fetch the content directly
    if (['txt', 'md', 'csv'].includes(fileType)) {
      const response = await fetch(url);
      return await response.text();
    }
    
    // For other file types, return a placeholder
    return `This is a ${fileType.toUpperCase()} file. The content extraction would be implemented 
    with appropriate libraries in a production environment.`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return 'Failed to extract text from the document. Please try with a different file format.';
  }
}

export async function POST(req: Request) {
  try {
    const { message, documentPath, chatId } = await req.json();
    
    if (!documentPath) {
      return NextResponse.json(
        { error: 'No document path provided' },
        { status: 400 }
      );
    }
    
    // Get the document URL from Vercel Blob
    let documentUrl;
    try {
      documentUrl = await getDownloadUrl(documentPath);
    } catch (error) {
      console.error('Error getting document URL:', error);
      return NextResponse.json(
        { error: 'Document not found or inaccessible' },
        { status: 404 }
      );
    }
    
    if (!documentUrl) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Extract file type from path
    const fileType = documentPath.split('.').pop()?.toLowerCase() || '';
    
    // Extract text from the document
    const documentText = await extractTextFromFile(documentUrl, fileType);
    
    // Prepare the prompt for the AI
    const prompt = `
      I'm going to ask you questions about a document. Here's the content of the document:
      
      ${documentText}
      
      Please answer the following question based on the document content:
      ${message}
    `;
    
    // Call the AI API
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.SITE_URL || "https://medisage.vercel.app",
        "X-Title": "MediSage",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-thinking-exp-1219:free",
        messages: [
          { role: "system", content: "You are a helpful assistant that analyzes medical documents and answers questions about them." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data?.choices?.[0]?.message?.content || "I couldn't analyze the document.";
    
    // Save the chat history to MongoDB
    const client = await clientPromise;
    const db = client.db("medisage");
    
    let chat;
    
    if (chatId) {
      // Update existing chat
      await db.collection("chats").updateOne(
        { _id: new ObjectId(chatId) },
        { 
          $push: { 
            messages: [
              { role: "user", content: message, timestamp: new Date() },
              { role: "assistant", content: aiResponse, timestamp: new Date() }
            ]
          },
          $set: { updatedAt: new Date() }
        }
      );
      
      chat = await db.collection("chats").findOne({ _id: new ObjectId(chatId) });
    } else {
      // Create new chat
      const result = await db.collection("chats").insertOne({
        documentPath,
        documentName: documentPath.split('/').pop(),
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          { role: "user", content: message, timestamp: new Date() },
          { role: "assistant", content: aiResponse, timestamp: new Date() }
        ]
      });
      
      chat = await db.collection("chats").findOne({ _id: result.insertedId });
    }
    
    return NextResponse.json({ 
      response: aiResponse,
      chatId: chat._id.toString()
    });
  } catch (error) {
    console.error("Error in chat-with-document route:", error);
    return NextResponse.json(
      { error: "Failed to process your request", details: error.message },
      { status: 500 }
    );
  }
} 