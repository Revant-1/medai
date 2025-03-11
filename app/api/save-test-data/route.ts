import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const { testType, formData, userId = 'default' } = await req.json();
    
    if (!testType || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("medisage");
    
    // Add metadata to the test data
    const testData = {
      userId,
      testType,
      formData,
      createdAt: new Date(),
      result: calculateRiskScore(formData, testType) // Calculate a simple risk score
    };
    
    // Save to database
    const result = await db.collection("healthTests").insertOne(testData);
    
    return NextResponse.json({
      success: true,
      testId: result.insertedId.toString(),
      message: 'Test data saved successfully'
    });
  } catch (error) {
    console.error("Error saving test data:", error);
    return NextResponse.json(
      { error: "Failed to save test data", details: error.message },
      { status: 500 }
    );
  }
}

// Simple function to calculate a risk score based on the form data
function calculateRiskScore(formData: any, testType: string): { score: number; risk: string } {
  let score = 0;
  
  // Different calculation based on test type
  if (testType === 'heart-test-1') {
    // Age factor
    if (formData.age) {
      const age = parseInt(formData.age);
      if (age > 60) score += 3;
      else if (age > 45) score += 2;
      else if (age > 30) score += 1;
    }
    
    // Chest pain factor
    if (formData.cp === '3' || formData.cp === '2') score += 2;
    
    // Blood pressure factor
    if (formData.trestbps && parseInt(formData.trestbps) > 140) score += 2;
    
    // Cholesterol factor
    if (formData.chol && parseInt(formData.chol) > 240) score += 2;
    
    // Fasting blood sugar factor
    if (formData.fbs === '1') score += 1;
    
    // ECG factor
    if (formData.restecg === '2') score += 1;
    
    // Max heart rate factor
    if (formData.thalach && parseInt(formData.thalach) < 120) score += 2;
    
    // Exercise-induced angina
    if (formData.exang === '1') score += 2;
    
    // ST depression
    if (formData.oldpeak && parseFloat(formData.oldpeak) > 2) score += 2;
    
    // Number of vessels
    if (formData.ca === '3') score += 3;
    else if (formData.ca === '2') score += 2;
    else if (formData.ca === '1') score += 1;
  } 
  else if (testType === 'heart-test-2') {
    // Similar logic for the second test
    if (formData.age) {
      const age = parseInt(formData.age);
      if (age > 60) score += 3;
      else if (age > 45) score += 2;
      else if (age > 30) score += 1;
    }
    
    if (formData.chestpain === '3' || formData.chestpain === '2') score += 2;
    if (formData.restingBP && parseInt(formData.restingBP) > 140) score += 2;
    if (formData.serumcholestrol && parseInt(formData.serumcholestrol) > 240) score += 2;
    if (formData.fastingbloodsugar === '1') score += 1;
    if (formData.restingrelectro === '1') score += 1;
    if (formData.maxheartrate && parseInt(formData.maxheartrate) < 120) score += 2;
    if (formData.exerciseangia === '1') score += 2;
    if (formData.oldpeak && parseFloat(formData.oldpeak) > 2) score += 2;
    if (formData.noofmajorvessels === '3') score += 3;
    else if (formData.noofmajorvessels === '2') score += 2;
    else if (formData.noofmajorvessels === '1') score += 1;
  }
  
  // Determine risk level based on score
  let risk = 'Low';
  if (score >= 10) risk = 'High';
  else if (score >= 5) risk = 'Moderate';
  
  return { score, risk };
} 