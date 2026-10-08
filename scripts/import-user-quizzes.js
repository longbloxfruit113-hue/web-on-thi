const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dbPath = path.join(__dirname, "../quiz.db");
const db = new Database(dbPath);

const sourceDir = "C:\\Users\\LSC\\Documents\\antigravity\\resilient-volta\\Môn học";

// 1. Delete all existing quizzes, questions, options
console.log("Cleaning up old quizzes, questions, and options...");
db.exec(`
  DELETE FROM options;
  DELETE FROM questions;
  DELETE FROM quizzes;
`);
console.log("All existing quizzes cleared.");

// 2. Ensure subjects exist: Vật Lí, Lịch Sử, Địa Lí
const subjectsToEnsure = [
  {
    id: "sub-vat-ly",
    name: "Vật Lí",
    slug: "vat-ly",
    description: "Cơ năng, Động năng, Thế năng, Công và Công suất lớp 9",
    icon: "Atom",
    color: "violet",
    order_index: 1,
  },
  {
    id: "sub-lich-su",
    name: "Lịch Sử",
    slug: "lich-su",
    description: "Lịch sử thế giới và Việt Nam giai đoạn cận hiện đại",
    icon: "Landmark",
    color: "amber",
    order_index: 2,
  },
  {
    id: "sub-dia-li",
    name: "Địa Lí",
    slug: "dia-li",
    description: "Địa lí dân cư, các ngành kinh tế và vùng kinh tế trọng điểm lớp 9",
    icon: "BookOpen",
    color: "emerald",
    order_index: 3,
  },
];

for (const s of subjectsToEnsure) {
  const existing = db.prepare("SELECT id FROM subjects WHERE slug = ?").get(s.slug);
  if (!existing) {
    db.prepare(`
      INSERT INTO subjects (id, name, slug, description, icon, color, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(s.id, s.name, s.slug, s.description, s.icon, s.color, s.order_index);
    console.log(`Created subject: ${s.name} (${s.slug})`);
  } else {
    // Update name if needed (e.g., Vật Lí)
    db.prepare("UPDATE subjects SET name = ?, description = ? WHERE slug = ?").run(s.name, s.description, s.slug);
  }
}

// Helper to parse file
function parseQuizFile(filePath) {
  const rawText = fs.readFileSync(filePath, "utf8");
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const questions = [];

  let currentQuestion = null;
  let currentOptions = [];
  let currentExplanation = "";
  let inExplanation = false;

  const flush = () => {
    if (currentQuestion && currentOptions.length >= 2) {
      questions.push({
        content: currentQuestion,
        options: currentOptions,
        explanation: currentExplanation.trim(),
        orderIndex: questions.length + 1,
      });
    }
    currentQuestion = null;
    currentOptions = [];
    currentExplanation = "";
    inExplanation = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Question header: Câu 1. hoặc Câu 1:
    const qMatch = line.match(/^(?:Câu|Bài|\#)?\s*(\d+)[\.\:\-]\s*(.+)$/i);
    if (qMatch) {
      flush();
      currentQuestion = qMatch[2].trim();
      continue;
    }

    // Option: A. hoặc A:
    const optMatch = line.match(/^([A-D])[\.\)\:\-]\s*(.+)$/i);
    if (optMatch && currentQuestion) {
      inExplanation = false;
      currentOptions.push({
        key: optMatch[1].toUpperCase(),
        content: optMatch[2].trim(),
        isCorrect: false,
      });
      continue;
    }

    // Correct answer: Đáp án: A
    const ansMatch = line.match(/^(?:Đáp án|Đáp án đúng|Key|Ans|Chọn)[\:\s\-]+([A-D])/i);
    if (ansMatch && currentQuestion) {
      const correctKey = ansMatch[1].toUpperCase();
      currentOptions.forEach((o) => {
        if (o.key === correctKey) o.isCorrect = true;
      });
      continue;
    }

    // Explanation: Giải thích: ...
    const expMatch = line.match(/^(?:Giải thích|Lời giải|Hướng dẫn giải|Lý do|Căn cứ)[\:\s\-]+(.*)$/i);
    if (expMatch && currentQuestion) {
      inExplanation = true;
      currentExplanation += (expMatch[1] ? expMatch[1] + " " : "");
      continue;
    }

    if (inExplanation) {
      currentExplanation += line + " ";
    } else if (currentOptions.length > 0) {
      currentOptions[currentOptions.length - 1].content += " " + line;
    } else if (currentQuestion) {
      currentQuestion += " " + line;
    }
  }

  flush();
  return questions;
}

// 3. Import each file into its quiz
const fileConfigs = [
  {
    fileName: "Vật lí 9.txt",
    subjectSlug: "vat-ly",
    quizTitle: "Đề kiểm tra trắc nghiệm: Vật lí 9",
    quizSlug: "de-kiem-tra-vat-li-9",
    description: "Bộ câu hỏi kiểm tra kiến thức Cơ năng, Động năng, Thế năng, Công và Công suất lớp 9 có giải thích chi tiết.",
  },
  {
    fileName: "Lịch sử 9.txt",
    subjectSlug: "lich-su",
    quizTitle: "Đề kiểm tra trắc nghiệm: Lịch sử 9",
    quizSlug: "de-kiem-tra-lich-su-9",
    description: "Bộ câu hỏi trắc nghiệm Lịch sử thế giới và phong trào cách mạng lớp 9.",
  },
  {
    fileName: "Địa lí 9.txt",
    subjectSlug: "dia-li",
    quizTitle: "Đề kiểm tra trắc nghiệm: Địa lí 9",
    quizSlug: "de-kiem-tra-dia-li-9",
    description: "Bộ câu hỏi trắc nghiệm Địa lí dân cư, kinh tế và các vùng địa lí lớp 9.",
  },
];

for (const config of fileConfigs) {
  const filePath = path.join(sourceDir, config.fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    continue;
  }

  const subject = db.prepare("SELECT id FROM subjects WHERE slug = ?").get(config.subjectSlug);
  if (!subject) {
    console.error(`Subject not found for slug: ${config.subjectSlug}`);
    continue;
  }

  const quizId = "quiz-" + config.subjectSlug + "-9";
  db.prepare(`
    INSERT INTO quizzes (id, subject_id, title, slug, description, time_limit)
    VALUES (?, ?, ?, ?, ?, 15)
  `).run(quizId, subject.id, config.quizTitle, config.quizSlug, config.description);

  const questions = parseQuizFile(filePath);
  console.log(`Parsed ${questions.length} questions from ${config.fileName}`);

  const insertQ = db.prepare(`
    INSERT INTO questions (id, quiz_id, content, explanation, order_index)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertOpt = db.prepare(`
    INSERT INTO options (id, question_id, content, is_correct)
    VALUES (?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const q of questions) {
      const qId = "q-" + crypto.randomUUID().slice(0, 8);
      
      // Enhance physics formulas for KaTeX if needed
      let explanation = q.explanation;
      if (config.subjectSlug === "vat-ly") {
        // Enhance P=A/t -> \mathcal{P} = \frac{A}{t}
        explanation = explanation
          .replace(/Wđ=1\/2\.m\.v\^2/g, "$W_đ = \\frac{1}{2}mv^2$")
          .replace(/P=A\/t/g, "$\\mathcal{P} = \\frac{A}{t}$")
          .replace(/A=F\.s/g, "$A = F \\cdot s$")
          .replace(/Wt=P\.h=10\.m\.h/g, "$W_t = P \\cdot h = 10mh$")
          .replace(/Wt = 10mh/g, "$W_t = 10mh$")
          .replace(/s=0/g, "$s = 0$")
          .replace(/2\^2=4/g, "$2^2 = 4$");
      }

      insertQ.run(qId, quizId, q.content, explanation, q.orderIndex);

      for (const opt of q.options) {
        const optId = "opt-" + crypto.randomUUID().slice(0, 8);
        insertOpt.run(optId, qId, opt.content, opt.isCorrect ? 1 : 0);
      }
    }
  });

  tx();
  console.log(`Successfully imported ${questions.length} questions into "${config.quizTitle}"!`);
}

console.log("Database update complete!");
