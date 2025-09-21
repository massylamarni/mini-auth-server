import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Common CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const data = await req.json();

    const db = await connectToDatabase();
    const collection = db.collection("users");

    const newUser = await collection.insertOne({
      email: data.email,
      password: data.password,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { userId: newUser.insertedId },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json(
      { error: "Failed to save user" },
      { status: 500, headers: corsHeaders }
    );
  }
}
