import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("medisage");
    
    const results = await db.collection("testResults")
      .find({ userId: 'default' })
      .sort({ timestamp: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test results' },
      { status: 500 }
    );
  }
} 