import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

export async function POST(req: Request) {
  try {
    const { testType, formData } = await req.json();
    
    // Determine which endpoint to use based on test type
    const endpoint = testType === 'test-1' ? 'xgb' : 'rf';
    
    // Get prediction from ML API
    const predictionResponse = await fetch(`${ML_API_URL}/predict/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!predictionResponse.ok) {
      throw new Error(`ML API error: ${predictionResponse.status}`);
    }

    const predictionResult = await predictionResponse.json();

    // Save to MongoDB
    const client = await clientPromise;
    const db = client.db("medisage");
    
    const testResult = {
      name: formData.name,
      testType,
      formData,
      prediction: predictionResult,
      timestamp: new Date(),
      userId: 'default' // Replace with actual user ID when auth is implemented
    };

    await db.collection("testResults").insertOne(testResult);

    return NextResponse.json({
      success: true,
      data: predictionResult
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to process prediction' },
      { status: 500 }
    );
  }
} 