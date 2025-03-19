import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const chatId = searchParams.get("chatId");

  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("MediSage");
    const collection = db.collection("chatHistory");

    if (chatId) {
      // Get specific chat
      const chat = await collection.findOne({ userId, chatId });
      
      if (!chat) {
        return NextResponse.json({ success: false, error: "Chat not found" }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, messages: chat.messages });
    } else {
      // Get list of chats
      const chats = await collection
        .find({ userId })
        .sort({ updatedAt: -1 })
        .limit(20)
        .toArray();
      
      const formattedChats = chats.map(chat => ({
        id: chat.chatId,
        title: chat.title || "Untitled Chat",
        lastMessage: chat.messages[chat.messages.length - 1]?.content || "",
        timestamp: chat.updatedAt || chat.createdAt
      }));
      
      return NextResponse.json({ success: true, chats: formattedChats });
    }
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch chat history" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, chatId, messages } = await req.json();

    if (!userId || !chatId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("MediSage");
    const collection = db.collection("chatHistory");

    // Generate a title from the first user message if possible
    let title = "Untitled Chat";
    const firstUserMessage = messages.find(m => m.role === "user");
    if (firstUserMessage) {
      const content = typeof firstUserMessage.content === 'string' 
        ? firstUserMessage.content 
        : firstUserMessage.content.find(c => c.type === 'text')?.text || '';
      
      title = content.substring(0, 30) + (content.length > 30 ? "..." : "");
    }

    const now = new Date();

    // Update or insert the chat
    const result = await collection.updateOne(
      { userId, chatId },
      {
        $set: {
          messages,
          title,
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving chat history:", error);
    return NextResponse.json({ success: false, error: "Failed to save chat history" }, { status: 500 });
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