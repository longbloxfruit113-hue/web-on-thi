import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizId, content, explanation, options, orderIndex, type = "multiple_choice" } = body;

    if (!quizId || !content) {
      return NextResponse.json({
        success: false,
        error: "Vui lòng nhập đủ nội dung câu hỏi",
      }, { status: 400 });
    }

    if (type === "multiple_choice" && (!Array.isArray(options) || options.length < 2)) {
      return NextResponse.json({
        success: false,
        error: "Trắc nghiệm nhiều lựa chọn cần tối thiểu 2 phương án",
      }, { status: 400 });
    }

    if (type === "true_false" && (!Array.isArray(options) || options.length < 1)) {
      return NextResponse.json({
        success: false,
        error: "Trắc nghiệm Đúng/Sai cần tối thiểu 1 mệnh đề",
      }, { status: 400 });
    }

    if (type === "short_answer" && (!Array.isArray(options) || options.length < 1)) {
      return NextResponse.json({
        success: false,
        error: "Trắc nghiệm trả lời ngắn cần ít nhất 1 đáp án chuẩn",
      }, { status: 400 });
    }

    const questionId = "q-" + crypto.randomUUID().slice(0, 8);

    const statements: { sql: string; args: any[] }[] = [
      {
        sql: `INSERT INTO questions (id, quiz_id, content, explanation, order_index, type) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [questionId, quizId, content, explanation || "", orderIndex || 0, type],
      },
    ];

    if (Array.isArray(options)) {
      for (const opt of options) {
        const optId = "opt-" + crypto.randomUUID().slice(0, 8);
        statements.push({
          sql: `INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`,
          args: [optId, questionId, opt.content, opt.isCorrect ? 1 : 0],
        });
      }
    }

    await db.batch(statements);

    return NextResponse.json({ success: true, data: { id: questionId } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu question id" }, { status: 400 });
    }

    db.prepare("DELETE FROM questions WHERE id = ?").run(id);
    return NextResponse.json({ success: true, message: "Đã xóa câu hỏi" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
