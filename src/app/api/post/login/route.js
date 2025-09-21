import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

const corsHeaders = (req) => ({
  "Access-Control-Allow-Origin": req.headers.get("origin"),
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
});

export async function OPTIONS(req) {
  return NextResponse.json({}, { headers: corsHeaders(req) });
}

export async function POST(req) {
  try {
    const data = await req.json();

    const db = await connectToDatabase();
    const collection = db.collection("users");

    const user = await collection.findOne({ email: data.email });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: corsHeaders(req) }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "48h" }
    );

    // Send token back as cookie + JSON
    const res = NextResponse.json(
      { success: true, token },
      { status: 200, headers: corsHeaders(req) }
    );

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
