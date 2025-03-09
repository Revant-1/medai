import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("medisage");
    
    const user = await db.collection("users").findOne({ email: "test@example.com" });
    
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("medisage");
    const data = await req.json();
    
    const result = await db.collection("users").insertOne(data);
    
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("medisage");
    const data = await req.json();
    
    const result = await db.collection("users").updateOne(
      { email: data.email },
      { $set: data }
    );
    
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}