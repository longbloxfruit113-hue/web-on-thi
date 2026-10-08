import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "quiz.db");
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS study_materials (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    time_limit INTEGER DEFAULT 15,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    content TEXT NOT NULL,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    type TEXT DEFAULT 'multiple_choice',
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS options (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_correct INTEGER DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin'
  );
`);

// Migration: Add type column to questions if not exists
try {
  db.exec("ALTER TABLE questions ADD COLUMN type TEXT DEFAULT 'multiple_choice'");
} catch {
  // column already exists
}

// Seed default data if empty
const subjectCount = db.prepare("SELECT COUNT(*) as count FROM subjects").get() as { count: number };

if (subjectCount.count === 0) {
  // Seed admin user
  db.prepare(`
    INSERT OR IGNORE INTO admin_users (id, username, password, role)
    VALUES ('admin-1', 'admin', 'admin123', 'admin')
  `).run();

  // 1. Môn Toán
  const mathId = "sub-toan";
  db.prepare(`
    INSERT INTO subjects (id, name, slug, description, icon, color, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    mathId,
    "Toán Học",
    "toan-hoc",
    "Khảo sát hàm số, Hình học không gian, Tích phân & Số phức",
    "Calculator",
    "blue",
    1
  );

  // Tài liệu ôn thi Toán
  db.prepare(`
    INSERT INTO study_materials (id, subject_id, title, slug, summary, content, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    "mat-toan-1",
    mathId,
    "Tóm tắt Lý thuyết & Công thức Đạo hàm - Khảo sát hàm số",
    "ly-thuyet-dao-ham-khao-sat-ham-so",
    "Tổng hợp bảng nguyên hàm đạo hàm cơ bản, cực trị và tiệm cận đồ thị hàm số.",
    `### 1. Bảng Đạo Hàm Các Hàm Số Cơ Bản
- $(x^n)' = n \\cdot x^{n-1}$ (với $n \\in \\mathbb{R}$)
- $(\\sqrt{x})' = \\frac{1}{2\\sqrt{x}}$ ($x > 0$)
- $(\\sin x)' = \\cos x$
- $(\\cos x)' = -\\sin x$
- $(\\tan x)' = \\frac{1}{\\cos^2 x} = 1 + \\tan^2 x$
- $(e^x)' = e^x$ ; $(a^x)' = a^x \\ln a$
- $(\\ln x)' = \\frac{1}{x}$ ($x > 0$)

---

### 2. Quy Tắc Xét Tính Đơn Điệu Của Hàm Số
Cho hàm số $y = f(x)$ xác định và có đạo hàm trên khoảng $(a; b)$:
- Nếu $f'(x) > 0$ với mọi $x \\in (a; b)$ thì hàm số **đồng biến** trên $(a; b)$.
- Nếu $f'(x) < 0$ với mọi $x \\in (a; b)$ thì hàm số **nghịch biến** trên $(a; b)$.
- **Lưu ý:** $f'(x) = 0$ chỉ tại một số hữu hạn điểm thì dấu của $f'(x)$ vẫn quyết định chiều biến thiên.

---

### 3. Cực Trị Của Đồ Thị Hàm Số
- Điểm cực trị là điểm mà tại đó đạo hàm đổi dấu từ dương sang âm (cực đại) hoặc từ âm sang dương (cực tiểu).
- Điều kiện cần: Nếu $x_0$ là điểm cực trị của $f(x)$ và $f$ có đạo hàm tại $x_0$ thì $f'(x_0) = 0$.`,
    1
  );

  // Đề thi Toán
  const quizMathId = "quiz-toan-1";
  db.prepare(`
    INSERT INTO quizzes (id, subject_id, title, slug, description, time_limit)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    quizMathId,
    mathId,
    "Đề kiểm tra ôn tập: Đạo hàm & Khảo sát hàm số (Cơ bản - Vận dụng)",
    "de-kiem-tra-dao-ham-ham-so",
    "Bộ câu hỏi kiểm tra kỹ năng tính đạo hàm, tìm cực trị và tiệm cận đồ thị.",
    15
  );

  // Câu 1 Toán
  const q1Id = "q-toan-1";
  db.prepare(`INSERT INTO questions (id, quiz_id, content, explanation, order_index) VALUES (?, ?, ?, ?, ?)`).run(
    q1Id,
    quizMathId,
    "Đạo hàm của hàm số $y = x^4 - 2x^2 + 1$ là:",
    "Áp dụng công thức $(x^n)' = n \\cdot x^{n-1}$, ta có $(x^4)' = 4x^3$, $(-2x^2)' = -4x$, $(1)' = 0$. Vậy $y' = 4x^3 - 4x = 4x(x^2 - 1)$.",
    1
  );
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-1-1", q1Id, "y' = 4x^3 - 4x", 1);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-1-2", q1Id, "y' = 4x^3 - 2x", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-1-3", q1Id, "y' = x^3 - 4x", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-1-4", q1Id, "y' = 4x^3 - 4", 0);

  // Câu 2 Toán
  const q2Id = "q-toan-2";
  db.prepare(`INSERT INTO questions (id, quiz_id, content, explanation, order_index) VALUES (?, ?, ?, ?, ?)`).run(
    q2Id,
    quizMathId,
    "Đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ có đường tiệm cận ngang là:",
    "Tiệm cận ngang của hàm phân thức bậc nhất trên bậc nhất $y = \\frac{ax + b}{cx + d}$ là đường thẳng $y = \\frac{a}{c}$. Ở đây $a = 2, c = 1 \\Rightarrow y = 2$.",
    2
  );
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-2-1", q2Id, "y = 2", 1);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-2-2", q2Id, "x = -1", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-2-3", q2Id, "y = -1", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-2-4", q2Id, "x = 2", 0);

  // Câu 3 Toán
  const q3Id = "q-toan-3";
  db.prepare(`INSERT INTO questions (id, quiz_id, content, explanation, order_index) VALUES (?, ?, ?, ?, ?)`).run(
    q3Id,
    quizMathId,
    "Số điểm cực trị của hàm số $y = x^3 - 3x + 2$ là:",
    "Ta có $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Vì $y'$ đổi dấu 2 lần khi qua $x = -1$ và $x = 1$ nên hàm số có 2 điểm cực trị.",
    3
  );
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-3-1", q3Id, "2", 1);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-3-2", q3Id, "1", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-3-3", q3Id, "0", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-3-4", q3Id, "3", 0);

  // 2. Môn Tiếng Anh
  const engId = "sub-tieng-anh";
  db.prepare(`
    INSERT INTO subjects (id, name, slug, description, icon, color, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    engId,
    "Tiếng Anh",
    "tieng-anh",
    "Ngữ pháp trọng điểm, Từ vựng chuyên sâu & Đọc hiểu THPT",
    "Languages",
    "emerald",
    2
  );

  // Tài liệu ôn thi Anh
  db.prepare(`
    INSERT INTO study_materials (id, subject_id, title, slug, summary, content, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    "mat-eng-1",
    engId,
    "Chuyên đề Câu Điều Kiện (Conditionals Type 1, 2, 3 & Mixed)",
    "chuyen-de-cau-dieu-kien",
    "Nắm vững cấu trúc, dấu hiệu nhận biết và cách đảo ngữ các loại câu điều kiện.",
    `### 1. Câu Điều Kiện Loại 1 (Có thật ở hiện tại/tương lai)
- **Cấu trúc:** If + S + V(hiện tại đơn), S + will / can / may + V-bare.
- **Ví dụ:** If it rains tomorrow, we will stay at home.
- **Đảo ngữ:** Should + S + V-bare, S + will + V-bare.

---

### 2. Câu Điều Kiện Loại 2 (Không có thật ở hiện tại)
- **Cấu trúc:** If + S + V-ed / Were, S + would / could / might + V-bare.
- **Ví dụ:** If I had more free time, I would learn Spanish.
- **Đảo ngữ:** Were + S + to V / Were + S + adj/noun, S + would + V-bare.

---

### 3. Câu Điều Kiện Loại 3 (Không có thật trong quá khứ)
- **Cấu trúc:** If + S + had + V3/ed, S + would have + V3/ed.
- **Ví dụ:** If she had studied harder, she would have passed the exam.
- **Đảo ngữ:** Had + S + V3/ed, S + would have + V3/ed.`,
    1
  );

  // Đề thi Anh
  const quizEngId = "quiz-eng-1";
  db.prepare(`
    INSERT INTO quizzes (id, subject_id, title, slug, description, time_limit)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    quizEngId,
    engId,
    "Đề kiểm tra Chuyên đề Ngữ pháp: Câu Điều Kiện & Mệnh Đề Quan Hệ",
    "de-kiem-tra-ngu-phap-cau-dieu-kien",
    "Đề thi 5 câu hỏi then chốt thường gặp trong các đề thi THPT Quốc Gia.",
    15
  );

  // Câu 1 Anh
  const qEng1 = "q-eng-1";
  db.prepare(`INSERT INTO questions (id, quiz_id, content, explanation, order_index) VALUES (?, ?, ?, ?, ?)`).run(
    qEng1,
    quizEngId,
    "If I ______ you, I would take that opportunity immediately.",
    "Đây là câu điều kiện loại 2 diễn tả giả định trái ngược với thực tế ở hiện tại. Mệnh đề IF dùng quá khứ giả định (động từ to be luôn dùng 'were' cho mọi ngôi).",
    1
  );
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e1-1", qEng1, "were", 1);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e1-2", qEng1, "am", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e1-3", qEng1, "had been", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e1-4", qEng1, "will be", 0);

  // Câu 2 Anh
  const qEng2 = "q-eng-2";
  db.prepare(`INSERT INTO questions (id, quiz_id, content, explanation, order_index) VALUES (?, ?, ?, ?, ?)`).run(
    qEng2,
    quizEngId,
    "The man ______ car was stolen reported the crime to the local police.",
    "Ta cần một đại từ quan hệ chỉ quyền sở hữu đối với danh từ 'car' đứng ngay sau đó. Do đó, 'whose' (của ai) là đáp án chính xác.",
    2
  );
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e2-1", qEng2, "whose", 1);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e2-2", qEng2, "whom", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e2-3", qEng2, "who", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e2-4", qEng2, "which", 0);

  // Câu 3 Anh
  const qEng3 = "q-eng-3";
  db.prepare(`INSERT INTO questions (id, quiz_id, content, explanation, order_index) VALUES (?, ?, ?, ?, ?)`).run(
    qEng3,
    quizEngId,
    "Had you told me about the schedule change earlier, I ______ my tickets.",
    "Đây là dạng đảo ngữ của câu điều kiện loại 3: 'Had + S + V3/ed'. Mệnh đề chính bắt buộc có dạng 'would have + V3/ed'. Do đó đáp án đúng là 'would have cancelled'.",
    3
  );
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e3-1", qEng3, "would have cancelled", 1);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e3-2", qEng3, "would cancel", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e3-3", qEng3, "will cancel", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-e3-4", qEng3, "had cancelled", 0);

  // 3. Môn Vật Lý
  const phyId = "sub-vat-ly";
  db.prepare(`
    INSERT INTO subjects (id, name, slug, description, icon, color, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    phyId,
    "Vật Lý",
    "vat-ly",
    "Dao động cơ, Sóng cơ, Dòng điện xoay chiều & Sóng ánh sáng",
    "Atom",
    "violet",
    3
  );

  db.prepare(`
    INSERT INTO study_materials (id, subject_id, title, slug, summary, content, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    "mat-phy-1",
    phyId,
    "Đại Cương Dao Động Điều Hòa & Các Đại Lượng Đặc Trưng",
    "dai-cuong-dao-dong-dieu-hoa",
    "Phương trình li độ, vận tốc, gia tốc, năng lượng dao động con lắc lò xo và con lắc đơn.",
    `### 1. Phương trình li độ dao động điều hòa
$x = A \\cos(\\omega t + \\varphi)$
- $x$: Li độ (cm hoặc m)
- $A$: Biên độ dao động ($A > 0$)
- $\\omega$: Tần số góc (rad/s)
- $(\\omega t + \\varphi)$: Pha dao động tại thời điểm $t$
- $\\varphi$: Pha ban đầu

---

### 2. Vận tốc và Gia tốc
- Vận tốc: $v = x' = -\\omega A \\sin(\\omega t + \\varphi) = \\omega A \\cos(\\omega t + \\varphi + \\frac{\\pi}{2})$
  * Vận tốc sớm pha $\\frac{\\pi}{2}$ so với li độ.
  * $v_{max} = \\omega A$ khi vật qua vị trí cân bằng theo chiều dương.
- Gia tốc: $a = v' = -\\omega^2 x = \\omega^2 A \\cos(\\omega t + \\varphi + \\pi)$
  * Gia tốc ngược pha so với li độ (sớm pha $\\pi$).
  * Gia tốc luôn hướng về vị trí cân bằng.`,
    1
  );

  const quizPhyId = "quiz-phy-1";
  db.prepare(`
    INSERT INTO quizzes (id, subject_id, title, slug, description, time_limit)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    quizPhyId,
    phyId,
    "Đề kiểm tra nhanh: Đại cương Dao động điều hòa",
    "de-kiem-tra-dao-dong-dieu-hoa",
    "Kiểm tra khái niệm li độ, vận tốc cực đại và gia tốc trong dao động.",
    15
  );

  const qPhy1 = "q-phy-1";
  db.prepare(`INSERT INTO questions (id, quiz_id, content, explanation, order_index) VALUES (?, ?, ?, ?, ?)`).run(
    qPhy1,
    quizPhyId,
    "Trong dao động điều hòa, vận tốc của vật đạt giá trị cực đại khi vật:",
    "Vận tốc có độ lớn cực đại $v_{max} = \\omega A$ khi vật đi qua vị trí cân bằng (tại đó li độ $x = 0$ và thế năng bằng 0, động năng đạt cực đại).",
    1
  );
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-p1-1", qPhy1, "Đi qua vị trí cân bằng theo chiều dương", 1);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-p1-2", qPhy1, "Ở vị trí biên dương", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-p1-3", qPhy1, "Ở vị trí biên âm", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-p1-4", qPhy1, "Có gia tốc đạt độ lớn cực đại", 0);

  // 4. Môn Lịch Sử
  const hisId = "sub-lich-su";
  db.prepare(`
    INSERT INTO subjects (id, name, slug, description, icon, color, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    hisId,
    "Lịch Sử",
    "lich-su",
    "Lịch sử Việt Nam hiện đại 1919 - 2000 & Lịch sử Thế giới cận hiện đại",
    "Landmark",
    "amber",
    4
  );

  db.prepare(`
    INSERT INTO study_materials (id, subject_id, title, slug, summary, content, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    "mat-his-1",
    hisId,
    "Các Mốc Lịch Sử Cách Mạng Tháng Tám Năm 1945",
    "cac-moc-lich-su-cach-mang-thang-tam-1945",
    "Hoàn cảnh lịch sử, diễn biến khởi nghĩa từng phần và ngày tổng khởi nghĩa giành chính quyền.",
    `### 1. Hoàn cảnh lịch sử
- Tháng 5/1945, phát xít Đức đầu hàng Đồng minh không điều kiện.
- Tháng 8/1945, phát xít Nhật đầu hàng Đồng minh. Quân Nhật ở Đông Dương hoang mang, rệu rã.
- Thời cơ "ngàn năm có một" đã xuất hiện.

---

### 2. Diễn biến Tổng khởi nghĩa
- Ngày 13/8/1945: Ủy ban Khởi nghĩa toàn quốc ban bố Quân lệnh số 1, phát lệnh Tổng khởi nghĩa.
- 4 tỉnh giành chính quyền sớm nhất trong cả nước (ngày 18/8/1945): **Bắc Giang, Hải Dương, Hà Tĩnh, Quảng Nam**.
- Ngày 19/8/1945: Khởi nghĩa giành thắng lợi tại Hà Nội.
- Ngày 2/9/1945: Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình, khai sinh nước Việt Nam Dân chủ Cộng hòa.`,
    1
  );

  const quizHisId = "quiz-his-1";
  db.prepare(`
    INSERT INTO quizzes (id, subject_id, title, slug, description, time_limit)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    quizHisId,
    hisId,
    "Đề trắc nghiệm Lịch sử: Cách mạng Tháng Tám năm 1945",
    "de-trac-nghiem-cach-mang-thang-tam",
    "Bộ câu hỏi kiểm tra kiến thức về thời cơ, các địa phương khởi nghĩa tiêu biểu.",
    15
  );

  const qHis1 = "q-his-1";
  db.prepare(`INSERT INTO questions (id, quiz_id, content, explanation, order_index) VALUES (?, ?, ?, ?, ?)`).run(
    qHis1,
    quizHisId,
    "Bốn tỉnh giành chính quyền sớm nhất trong cả nước trong Cách mạng tháng Tám năm 1945 là:",
    "Ngày 18/8/1945, nhân dân 4 tỉnh Bắc Giang, Hải Dương, Hà Tĩnh, Quảng Nam đã giành được chính quyền ở tỉnh lị, là 4 tỉnh giành chính quyền sớm nhất cả nước.",
    1
  );
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-h1-1", qHis1, "Bắc Giang, Hải Dương, Hà Tĩnh, Quảng Nam", 1);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-h1-2", qHis1, "Hà Nội, Huế, Sài Gòn, Đà Nẵng", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-h1-3", qHis1, "Thái Nguyên, Tuyên Quang, Cao Bằng, Lạng Sơn", 0);
  db.prepare(`INSERT INTO options (id, question_id, content, is_correct) VALUES (?, ?, ?, ?)`).run("opt-h1-4", qHis1, "Bắc Ninh, Hưng Yên, Nghệ An, Quảng Ngãi", 0);
}

// Database helper queries
export const getSubjects = () => {
  return db.prepare(`
    SELECT s.*, 
      (SELECT COUNT(*) FROM study_materials m WHERE m.subject_id = s.id) as material_count,
      (SELECT COUNT(*) FROM quizzes q WHERE q.subject_id = s.id) as quiz_count
    FROM subjects s
    ORDER BY s.order_index ASC, s.created_at ASC
  `).all();
};

export const getSubjectBySlug = (slug: string) => {
  return db.prepare("SELECT * FROM subjects WHERE slug = ?").get(slug) as any;
};

export const getMaterialsBySubjectId = (subjectId: string) => {
  return db.prepare("SELECT * FROM study_materials WHERE subject_id = ? ORDER BY order_index ASC").all(subjectId) as any[];
};

export const getMaterialBySlug = (subjectId: string, slug: string) => {
  return db.prepare("SELECT * FROM study_materials WHERE subject_id = ? AND slug = ?").get(subjectId, slug) as any;
};

export const getQuizzesBySubjectId = (subjectId: string) => {
  return db.prepare(`
    SELECT q.*, (SELECT COUNT(*) FROM questions qu WHERE qu.quiz_id = q.id) as question_count
    FROM quizzes q
    WHERE q.subject_id = ?
    ORDER BY q.created_at ASC
  `).all(subjectId) as any[];
};

export const getQuizBySlug = (subjectId: string, slug: string) => {
  const quiz = db.prepare("SELECT * FROM quizzes WHERE subject_id = ? AND slug = ?").get(subjectId, slug) as any;
  if (!quiz) return null;

  const questions = db.prepare("SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index ASC").all(quiz.id) as any[];
  
  for (const q of questions) {
    q.options = db.prepare("SELECT * FROM options WHERE question_id = ? ORDER BY id ASC").all(q.id);
  }

  quiz.questions = questions;
  return quiz;
};

export const getQuizById = (id: string) => {
  const quiz = db.prepare("SELECT * FROM quizzes WHERE id = ?").get(id) as any;
  if (!quiz) return null;

  const questions = db.prepare("SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index ASC").all(quiz.id) as any[];
  
  for (const q of questions) {
    q.options = db.prepare("SELECT * FROM options WHERE question_id = ? ORDER BY id ASC").all(q.id);
  }

  quiz.questions = questions;
  return quiz;
};

export { db };
