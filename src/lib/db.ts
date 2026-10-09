import { createClient } from "@libsql/client";

const TURSO_DATABASE_URL =
  process.env.TURSO_DATABASE_URL ||
  "libsql://quiz-db-longbloxfruit113-hue.aws-ap-northeast-1.turso.io";

const TURSO_AUTH_TOKEN =
  process.env.TURSO_AUTH_TOKEN ||
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTE1MjQ2ODcsImlkIjoiMDFhMTFmMzAtYmQwMS03NGYyLTkxZWYtMmE4OGU5M2NkZmI2Iiwia2lkIjoidmxRVFd1azc5VEllTHhjZkxEVlA3QllSMm0xRFQ5LXpnLWRBRkNBVUwxcyIsInJpZCI6IjkwYmQxNzA4LWI0YjAtNGQ3Ny1iOTBmLWQyNGJjMGVlZDA1MyJ9.AOhq1OUhJT9P7PwJiE3YDjzv1ttlxho0GOFUjgCd8IKg3-sfqpOx6lYlC24e_zSkZCUDbNsnrTa3YF3pv2udAw";

export const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

export const db = {
  prepare(sql: string) {
    return {
      async all(...args: any[]) {
        const flatArgs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        const res = await client.execute({ sql, args: flatArgs });
        return res.rows as any[];
      },
      async get(...args: any[]) {
        const flatArgs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        const res = await client.execute({ sql, args: flatArgs });
        return (res.rows[0] as any) || null;
      },
      async run(...args: any[]) {
        const flatArgs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return await client.execute({ sql, args: flatArgs });
      },
    };
  },
  async batch(statements: { sql: string; args?: any[] }[], mode: "write" | "read" | "deferred" = "write") {
    return await client.batch(statements, mode);
  },
  async execute(stmt: string | { sql: string; args: any[] }) {
    return await client.execute(stmt);
  },
};

// Database helper queries
export const getSubjects = async () => {
  const res = await client.execute(`
    SELECT s.*, 
      (SELECT COUNT(*) FROM study_materials m WHERE m.subject_id = s.id) as material_count,
      (SELECT COUNT(*) FROM quizzes q WHERE q.subject_id = s.id) as quiz_count
    FROM subjects s
    ORDER BY s.order_index ASC, s.created_at ASC
  `);
  return res.rows as any[];
};

export const getSubjectBySlug = async (slug: string) => {
  const res = await client.execute({
    sql: "SELECT * FROM subjects WHERE slug = ?",
    args: [slug],
  });
  return (res.rows[0] as any) || null;
};

export const getMaterialsBySubjectId = async (subjectId: string) => {
  const res = await client.execute({
    sql: "SELECT * FROM study_materials WHERE subject_id = ? ORDER BY order_index ASC",
    args: [subjectId],
  });
  return res.rows as any[];
};

export const getMaterialBySlug = async (subjectId: string, slug: string) => {
  const res = await client.execute({
    sql: "SELECT * FROM study_materials WHERE subject_id = ? AND slug = ?",
    args: [subjectId, slug],
  });
  return (res.rows[0] as any) || null;
};

export const getQuizzesBySubjectId = async (subjectId: string) => {
  const res = await client.execute({
    sql: `
      SELECT q.*, (SELECT COUNT(*) FROM questions qu WHERE qu.quiz_id = q.id) as question_count
      FROM quizzes q
      WHERE q.subject_id = ?
      ORDER BY q.created_at ASC
    `,
    args: [subjectId],
  });
  return res.rows as any[];
};

export const getQuizBySlug = async (subjectId: string, slug: string) => {
  const quizRes = await client.execute({
    sql: "SELECT * FROM quizzes WHERE subject_id = ? AND slug = ?",
    args: [subjectId, slug],
  });
  const quiz = (quizRes.rows[0] as any) || null;
  if (!quiz) return null;

  const questionsRes = await client.execute({
    sql: "SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index ASC",
    args: [quiz.id],
  });
  const questions = questionsRes.rows as any[];

  for (const q of questions) {
    const optsRes = await client.execute({
      sql: "SELECT * FROM options WHERE question_id = ? ORDER BY id ASC",
      args: [q.id],
    });
    q.options = optsRes.rows as any[];
  }

  quiz.questions = questions;
  return quiz;
};

export const getQuizById = async (id: string) => {
  const quizRes = await client.execute({
    sql: "SELECT * FROM quizzes WHERE id = ?",
    args: [id],
  });
  const quiz = (quizRes.rows[0] as any) || null;
  if (!quiz) return null;

  const questionsRes = await client.execute({
    sql: "SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index ASC",
    args: [quiz.id],
  });
  const questions = questionsRes.rows as any[];

  for (const q of questions) {
    const optsRes = await client.execute({
      sql: "SELECT * FROM options WHERE question_id = ? ORDER BY id ASC",
      args: [q.id],
    });
    q.options = optsRes.rows as any[];
  }

  quiz.questions = questions;
  return quiz;
};
