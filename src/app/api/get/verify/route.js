import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    return NextResponse.json({ message: "Protected content", user: decoded });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
}
