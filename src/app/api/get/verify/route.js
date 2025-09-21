import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    // Get the token from the cookie
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the JWT
    const user = jwt.verify(token, JWT_SECRET);

    // Return the user info
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("JWT verification error:", err);
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 403 }
    );
  }
}
