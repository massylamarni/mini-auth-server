import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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

export async function GET(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: corsHeaders(req) }
      );
    }

    const user = jwt.verify(token, JWT_SECRET);

    return NextResponse.json({ user }, { status: 200, headers: corsHeaders(req) });
  } catch (err) {
    console.error("JWT verification error:", err);
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 403, headers: corsHeaders(req) }
    );
  }
}
