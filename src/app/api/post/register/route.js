import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  // Common CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": req.headers.get("origin"),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  try {
    const data = await req.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!data.password || data.password.length < 10) {
      return NextResponse.json(
        { error: "Password must be at least 10 characters long" },
        { status: 400, headers: corsHeaders }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection("users");

    const existing = await collection.findOne({ email: data.email });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400, headers: corsHeaders }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await collection.insertOne({
      email: data.email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    const token = jwt.sign(
      { userId: newUser.insertedId, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: "48h" }
    );

    const res = NextResponse.json(
      { success: true },
      { status: 201, headers: corsHeaders }
    );

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json(
      { error: "Failed to save user" },
      { status: 500, headers: corsHeaders }
    );
  }
}
