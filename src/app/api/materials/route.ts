import { NextResponse } from "next/server";
import { db, getMaterialsBySubjectId } from "@/lib/db";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    if (!subjectId) {
      return NextResponse.json({ success: false, error: "Thiếu subjectId" }, { status: 400 });
    }

    const materials = getMaterialsBySubjectId(subjectId);
    return NextResponse.json({ success: true, data: materials });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subjectId, title, slug, summary, content } = body;

    if (!subjectId || !title || !slug || !content) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập đủ các trường bắt buộc" }, { status: 400 });
    }

    const id = "mat-" + crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO study_materials (id, subject_id, title, slug, summary, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, subjectId, title, slug, summary || "", content);

    return NextResponse.json({ success: true, data: { id, title, slug } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
