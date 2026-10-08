import { NextResponse } from "next/server";
import { db, getMaterialsBySubjectId } from "@/lib/db";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    if (subjectId) {
      const materials = getMaterialsBySubjectId(subjectId);
      return NextResponse.json({ success: true, data: materials });
    }

    const allMaterials = db.prepare(`
      SELECT m.*, s.name as subject_name
      FROM study_materials m
      JOIN subjects s ON m.subject_id = s.id
      ORDER BY m.created_at DESC
    `).all();

    return NextResponse.json({ success: true, data: allMaterials });
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu id tài liệu cần xóa" }, { status: 400 });
    }

    db.prepare("DELETE FROM study_materials WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: "Đã xóa bài học lý thuyết thành công!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

