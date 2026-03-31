import { NextResponse } from "next/server";

const PIN = "1234";

export async function POST(request: Request) {
  const { pin } = await request.json();

  if (pin === PIN) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("family-pin", PIN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // 30 days
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("family-pin");
  return response;
}
