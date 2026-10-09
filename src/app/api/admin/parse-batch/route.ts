import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseRawQuizText } from "@/lib/parser";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText, quizId, saveDirectly } = body;

    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json({ success: false, error: "Vui lòng dán nội dung tài liệu câu hỏi vào ô nhập liệu" }, { status: 400 });
    }

    const parsedQuestions = parseRawQuizText(rawText);

    if (parsedQuestions.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Không bóc tách được câu hỏi nào. Vui lòng kiểm tra lại định dạng (Ví dụ: 'Câu 1: ... A. ... B. ... Đáp án: A. Giải thích: ...')",
      }, { status: 400 });
    }

    // If requested to save directly into the quiz
    if (saveDirectly && quizId) {
      const statements: { sql: string; args: any[] }[] = [];
      for (const q of parsedQuestions) {
        const questionId = "q-" + crypto.randomUUID().slice(0, 8);
        statements.push({
          sql: `INSERT INTO questions (id, quiz_id, content, explanation, order_index, type) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [questionId, quizId, q.content, q.explanation || "", q.orderIndex, q.type || "multiple_choice"],
        });

        for (const opt of q.options) {
          const optId = "opt-" + crypto.randomUUID().slice(0, 8);
          statements.push({
            sql: `INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`,
            args: [optId, questionId, opt.content, opt.isCorrect ? 1 : 0],
          });
        }
      }

      await db.batch(statements);

      return NextResponse.json({
        success: true,
        saved: true,
        count: parsedQuestions.length,
        message: `Đã xử lý thông tin thành công và nạp ${parsedQuestions.length} câu hỏi vào bài kiểm tra!`,
        data: parsedQuestions,
      });
    }

    // Preview mode
    return NextResponse.json({
      success: true,
      saved: false,
      count: parsedQuestions.length,
      data: parsedQuestions,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
