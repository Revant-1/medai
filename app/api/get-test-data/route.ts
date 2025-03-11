import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || 'default';
    
    const client = await clientPromise;
    const db = client.db("medisage");
    
    // Fetch all tests for this user
    const tests = await db.collection("healthTests")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      tests
    });
  } catch (error) {
    console.error("Error fetching test data:", error);
    return NextResponse.json(
      { error: "Failed to fetch test data", details: error.message },
      { status: 500 }
    );
  }
} 