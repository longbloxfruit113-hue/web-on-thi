import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = (await db.prepare("SELECT * FROM admin_users WHERE username = ? AND password = ?").get(username, password)) as any;

    if (!user) {
      return NextResponse.json({ success: false, error: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
