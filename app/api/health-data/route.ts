import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || 'default';
    
    const client = await clientPromise;
    const db = client.db("medisage");
    
    // Check if we have data for this user
    const userData = await db.collection("healthData").findOne({ userId });
    
    if (userData) {
      return NextResponse.json({ success: true, data: userData });
    }
    
    // If no data exists, return sample data
    const sampleData = {
      userId,
      heartRate: [
        { date: '2023-01-01', value: 72 },
        { date: '2023-01-02', value: 75 },
        { date: '2023-01-03', value: 68 },
        { date: '2023-01-04', value: 70 },
        { date: '2023-01-05', value: 73 },
        { date: '2023-01-06', value: 71 },
        { date: '2023-01-07', value: 69 },
      ],
      bloodPressure: [
        { date: '2023-01-01', systolic: 120, diastolic: 80 },
        { date: '2023-01-02', systolic: 122, diastolic: 82 },
        { date: '2023-01-03', systolic: 118, diastolic: 78 },
        { date: '2023-01-04', systolic: 121, diastolic: 79 },
        { date: '2023-01-05', systolic: 123, diastolic: 83 },
        { date: '2023-01-06', systolic: 119, diastolic: 80 },
        { date: '2023-01-07', systolic: 120, diastolic: 81 },
      ],
      cholesterol: [
        { date: '2023-01-01', total: 180, ldl: 100, hdl: 60 },
        { date: '2023-01-02', total: 185, ldl: 105, hdl: 58 },
        { date: '2023-01-03', total: 178, ldl: 98, hdl: 62 },
        { date: '2023-01-04', total: 182, ldl: 102, hdl: 59 },
        { date: '2023-01-05', total: 187, ldl: 107, hdl: 57 },
        { date: '2023-01-06', total: 179, ldl: 99, hdl: 61 },
        { date: '2023-01-07', total: 183, ldl: 103, hdl: 60 },
      ],
      glucose: [
        { date: '2023-01-01', value: 95 },
        { date: '2023-01-02', value: 98 },
        { date: '2023-01-03', value: 92 },
        { date: '2023-01-04', value: 94 },
        { date: '2023-01-05', value: 99 },
        { date: '2023-01-06', value: 93 },
        { date: '2023-01-07', value: 96 },
      ],
      weight: [
        { date: '2023-01-01', value: 70.5 },
        { date: '2023-01-02', value: 70.3 },
        { date: '2023-01-03', value: 70.2 },
        { date: '2023-01-04', value: 70.0 },
        { date: '2023-01-05', value: 69.8 },
        { date: '2023-01-06', value: 69.7 },
        { date: '2023-01-07', value: 69.5 },
      ],
    };
    
    // Save the sample data for future use
    await db.collection("healthData").insertOne(sampleData);
    
    return NextResponse.json({ success: true, data: sampleData });
  } catch (error) {
    console.error("Error fetching health data:", error);
    return NextResponse.json(
      { error: "Failed to fetch health data", details: error.message },
      { status: 500 }
    );
  }
} 