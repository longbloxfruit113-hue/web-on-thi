import { NextResponse } from "next/server";
import { db, getQuizzesBySubjectId } from "@/lib/db";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    if (subjectId) {
      const quizzes = await getQuizzesBySubjectId(subjectId);
      return NextResponse.json({ success: true, data: quizzes });
    }

    const allQuizzes = await db.prepare(`
      SELECT q.*, s.name as subject_name, (SELECT COUNT(*) FROM questions qu WHERE qu.quiz_id = q.id) as question_count
      FROM quizzes q
      JOIN subjects s ON q.subject_id = s.id
      ORDER BY q.created_at DESC
    `).all();

    return NextResponse.json({ success: true, data: allQuizzes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subjectId, title, slug, description, timeLimit } = body;

    if (!subjectId || !title || !slug) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập đủ subjectId, tiêu đề và slug" }, { status: 400 });
    }

    const id = "quiz-" + crypto.randomUUID().slice(0, 8);
    await db.prepare(`
      INSERT INTO quizzes (id, subject_id, title, slug, description, time_limit)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, subjectId, title, slug, description || "", Number(timeLimit) || 15);

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
      return NextResponse.json({ success: false, error: "Thiếu id bài kiểm tra cần xóa" }, { status: 400 });
    }

    // Explicitly delete cascade in order to guarantee clean removal
    await db.prepare(`
      DELETE FROM options WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ?)
    `).run(id);
    await db.prepare("DELETE FROM questions WHERE quiz_id = ?").run(id);
    await db.prepare("DELETE FROM quizzes WHERE id = ?").run(id);

    return NextResponse.json({ success: true, message: "Đã xóa bài kiểm tra và toàn bộ câu hỏi liên quan thành công!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

