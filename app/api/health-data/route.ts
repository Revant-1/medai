import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("medisage");

    // Fetch health data for a specific user
    const userId = req.url.split('?userId=')[1] || 'default'; // Default userId for testing
    const healthData = await db.collection("healthData").findOne({ userId });

    if (!healthData) {
      return NextResponse.json({ success: false, error: 'No health data found for this user.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: healthData });
  } catch (error) {
    console.error("Error fetching health data:", error);
    return NextResponse.json({ error: "Failed to fetch health data", details: error.message }, { status: 500 });
  }
} 