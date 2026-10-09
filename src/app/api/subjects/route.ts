import { NextResponse } from "next/server";
import { db, getSubjects } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  try {
    const subjects = await getSubjects();
    return NextResponse.json({ success: true, data: subjects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, icon, color } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Tên môn và slug không được để trống" }, { status: 400 });
    }

    const id = "sub-" + crypto.randomUUID().slice(0, 8);
    const existing = await db.prepare("SELECT id FROM subjects WHERE slug = ?").get(slug);
    if (existing) {
      return NextResponse.json({ success: false, error: "Slug môn học này đã tồn tại" }, { status: 400 });
    }

    await db.prepare(`
      INSERT INTO subjects (id, name, slug, description, icon, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, slug, description || "", icon || "BookOpen", color || "blue");

    return NextResponse.json({ success: true, data: { id, name, slug } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
