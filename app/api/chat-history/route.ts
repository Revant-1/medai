import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const chatId = url.searchParams.get('chatId');
    
    if (!chatId) {
      // If no chatId is provided, return all chats
      const client = await clientPromise;
      const db = client.db("medisage");
      
      const chats = await db.collection("chats")
        .find({})
        .sort({ updatedAt: -1 })
        .toArray();
      
      return NextResponse.json({ chats });
    } else {
      // Return specific chat
      const client = await clientPromise;
      const db = client.db("medisage");
      
      const chat = await db.collection("chats").findOne({ _id: new ObjectId(chatId) });
      
      if (!chat) {
        return NextResponse.json(
          { error: 'Chat not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ chat });
    }
  } catch (error) {
    console.error("Error in chat-history route:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chat history" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { chatId } = await req.json();
    
    if (!chatId) {
      return NextResponse.json(
        { error: 'No chat ID provided' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("medisage");
    
    const result = await db.collection("chats").deleteOne({ _id: new ObjectId(chatId) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in chat-history route:", error);
    return NextResponse.json(
      { error: "Failed to delete chat history" },
      { status: 500 }
    );
  }
} 