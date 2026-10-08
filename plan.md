# Kế hoạch phát triển Hệ thống Web Ôn thi & Trắc nghiệm tương tác (Quiz & Study Platform)

## 1. Tổng quan dự án & Mục tiêu

Xây dựng nền tảng web ôn thi trực tuyến hiện đại, giao diện sáng sủa (clean light theme), tối ưu trải nghiệm học tập và ôn luyện theo từng môn học. Hệ thống kết hợp giữa **Lý thuyết ôn tập** và **Luyện trắc nghiệm tương tác tức thì (Instant Feedback Quiz)** cùng **Trang quản trị (Admin Portal)** để chủ động cập nhật tài liệu và ngân hàng câu hỏi.

---

## 2. Luồng trải nghiệm người dùng (User Experience & Flow)

### 2.1. Phía Học viên / Người ôn thi
```
[Trang chủ]
   │
   ├──> [Chọn môn học (Toán, Lý, Hóa, Ngoại ngữ, v.v.)]
   │       │
   │       ├──> [Khu vực Kiến thức (Lý thuyết ôn thi)]
   │       │       └── Đọc tài liệu tóm tắt, công thức, bài giảng theo từng chuyên đề
   │       │
   │       └──> [Khu vực Bài kiểm tra / Luyện đề]
   │               └── Chọn đề thi hoặc chủ đề trắc nghiệm
   │                       │
   │                       ▼
   │               [Màn hình làm Quiz tương tác]
   │               - Hiển thị câu hỏi + 4 đáp án lựa chọn
   │               - Học viên chọn đáp án -> Bấm [Xác nhận]
   │               - Kiểm tra kết quả:
   │                   * ĐÚNG: Đổi màu xanh lá, thông báo chính xác -> chuyển câu tiếp theo
   │                   * SAI: Đổi màu đỏ đáp án đã chọn, làm nổi bật đáp án đúng (xanh),
   │                          hiển thị ngay khung [Giải thích chi tiết] ở bên dưới
   │               - Chuyển sang câu kế tiếp sau khi đã xem lời giải
   │               - Tổng kết điểm số, thống kê số câu đúng/sai, làm lại đề
```

### 2.2. Phía Quản trị viên (Admin Portal)
```
[Đăng nhập Admin]
   │
   ├──> [Quản lý Môn học & Chuyên đề]: Tạo mới, sửa, sắp xếp thứ tự môn
   ├──> [Quản lý Nội dung Kiến thức]: Soạn thảo và đăng bài ôn tập theo từng môn
   └──> [Quản lý Ngân hàng câu hỏi & Đề thi]:
           - Thêm câu hỏi thủ công (Soạn câu hỏi, các lựa chọn, chọn đáp án đúng, nhập lời giải thích)
           - Nhập dữ liệu nhanh (Hỗ trợ nhập mẫu text/JSON/Excel để hệ thống tự parse thành bài trắc nghiệm)
           - Nhóm các câu hỏi thành từng bài kiểm tra theo môn
```

---

## 3. Kiến trúc kỹ thuật đề xuất (Tech Stack)

| Thành phần | Công nghệ đề xuất | Lý do lựa chọn |
|---|---|---|
| **Frontend Framework** | **Next.js (App Router) + React** | Hiệu năng cao, SEO tốt, tương thích mạnh mẽ, routing linh hoạt |
| **Styling & UI** | **Tailwind CSS + Lucide Icons + Radix UI** | Thiết kế phong cách sáng, sạch, hiện đại, hỗ trợ hiệu ứng chuyển đổi mượt mà |
| **State & Interactivity** | **React Hooks / Zustand** | Quản lý trạng thái làm bài quiz (câu hiện tại, điểm số, trạng thái đúng/sai) tức thì |
| **Database & ORM** | **SQLite / PostgreSQL + Prisma** | Lưu trữ quan hệ: Môn học -> Chuyên đề -> Đề thi -> Câu hỏi -> Lựa chọn -> Lời giải |
| **Authentication** | **JWT / NextAuth / Session-based** | Bảo vệ khu vực Admin, phân quyền chặt chẽ giữa học viên và người quản trị |

---

## 4. Chi tiết các phân hệ chức năng

### Phân hệ 1: Giao diện Người dùng & Thiết kế (UI/UX)
- **Phong cách thiết kế:** Giao diện tone sáng (Soft White / Slate / Emerald Green accent), bo góc nhẹ (rounded-xl), khoảng trắng thoáng đãng, phân chia khối rõ ràng.
- **Tương tác làm bài:**
  - Thanh tiến độ (Progress Bar) trực quan ở đầu màn hình hiển thị số câu đã hoàn thành.
  - Phím tắt tiện lợi (chọn phím 1-4 hoặc A-D, Enter để xác nhận) tăng tốc độ ôn luyện.
  - Hiệu ứng âm thanh/chuyển cảnh nhẹ nhàng tạo cảm giác hứng thú khi làm đúng.

### Phân hệ 2: Cơ chế Quiz tương tác tức thì (Interactive Quiz Engine)
- Mỗi câu hỏi hiển thị độc lập kèm danh sách các lựa chọn (A, B, C, D).
- Khi người dùng chọn 1 đáp án: nút **[Xác nhận đáp án]** kích hoạt.
- Sau khi bấm **[Xác nhận]**:
  - **Trường hợp đúng:** Thẻ đáp án được chọn hóa xanh lục (`bg-emerald-50 border-emerald-500`), hiện biểu tượng dấu tích xanh và nhãn "Chính xác!", tự động chuyển hoặc bấm nút chuyển sang câu tiếp theo.
  - **Trường hợp sai:** Thẻ đáp án được chọn hóa đỏ (`bg-rose-50 border-rose-500`), thẻ đáp án đúng tự động đổi sang màu xanh lục, phía dưới xuất hiện ngay khối **[Giải thích chi tiết]** giải nghĩa vì sao đáp án đó đúng để học viên ghi nhớ kiến thức ngay tại chỗ.

### Phân hệ 3: Module Kiến thức ôn thi (Study Material / Theory)
- Bố cục danh mục bài học theo từng môn:
  - Cột trái: Mục lục các chuyên đề / bài học lý thuyết.
  - Khung chính: Nội dung bài học hỗ trợ định dạng phong phú (tiêu đề, ghi chú, highlight công thức, hình ảnh minh họa, bảng so sánh).
  - Cuối mỗi bài đọc kiến thức có nút liên kết nhanh: **"Luyện tập bài trắc nghiệm của phần này ngay"**.

### Phân hệ 4: Phân hệ Quản trị (Admin CMS)
- **Soạn thảo câu hỏi trắc nghiệm:**
  - Nhập nội dung câu hỏi (hỗ trợ văn bản và hình ảnh).
  - Nhập 4 (hoặc nhiều hơn) phương án lựa chọn.
  - Đánh dấu đáp án chính xác.
  - Nhập lời giải thích / căn cứ sách giáo khoa hoặc tài liệu tham khảo.
- **Công cụ nhập nhanh (Batch Question Parser):**
  - Cho phép dán đoạn văn bản theo cú pháp chuẩn (ví dụ: `Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: A. Giải thích: ...`), hệ thống tự động bóc tách thành danh sách câu hỏi trong đề thi.
- **Quản lý tài liệu ôn thi:** Trình soạn thảo văn bản cho phép admin cập nhật nội dung bài giảng dễ dàng.

---

## 5. Cấu trúc cơ sở dữ liệu (Database Schema)

```prisma
// Mô hình Môn học
model Subject {
  id          String          @id @default(uuid())
  name        String          // Tên môn: Toán, Vật Lý, Hóa Học...
  slug        String          @unique
  description String?
  icon        String?         // Tên icon minh họa
  materials   StudyMaterial[] // Tài liệu kiến thức ôn thi
  quizzes     Quiz[]          // Các đề kiểm tra của môn
  createdAt   DateTime        @default(now())
}

// Mô hình Tài liệu kiến thức ôn thi
model StudyMaterial {
  id          String   @id @default(uuid())
  subjectId   String
  subject     Subject  @relation(fields: [subjectId], references: [id])
  title       String   // Tiêu đề bài học / chuyên đề
  slug        String   @unique
  content     String   // Nội dung lý thuyết chi tiết (Markdown/HTML)
  orderIndex  Int      @default(0)
  createdAt   DateTime @default(now())
}

// Mô hình Bài kiểm tra / Đề thi
model Quiz {
  id          String     @id @default(uuid())
  subjectId   String
  subject     Subject    @relation(fields: [subjectId], references: [id])
  title       String     // Tên bài kiểm tra: "Đề ôn tập Chương 1", "Kiểm tra 15 phút"...
  slug        String     @unique
  description String?
  timeLimit   Int?       // Thời gian làm bài (phút, nếu có)
  questions   Question[] // Danh sách câu hỏi
  createdAt   DateTime   @default(now())
}

// Mô hình Câu hỏi
model Question {
  id          String   @id @default(uuid())
  quizId      String
  quiz        Quiz     @relation(fields: [quizId], references: [id])
  content     String   // Nội dung câu hỏi
  explanation String   // Lời giải thích chi tiết khi chọn sai/đúng
  orderIndex  Int      @default(0)
  options     Option[] // Các phương án lựa chọn (A, B, C, D)
}

// Mô hình Phương án lựa chọn
model Option {
  id         String   @id @default(uuid())
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
  content    String   // Nội dung phương án
  isCorrect  Boolean  @default(false) // Đánh dấu đáp án đúng
}

// Mô hình Quản trị viên
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // Hashed password
  role      String   @default("admin") // admin
  createdAt DateTime @default(now())
}
```

---

## 6. Lộ trình triển khai (Implementation Phases)

### Giai đoạn 1: Khởi tạo nền tảng & Cơ sở dữ liệu
- Cài đặt cấu trúc project Next.js và tích hợp Tailwind CSS.
- Thiết lập Prisma Schema với SQLite/PostgreSQL cho toàn bộ mô hình (Subject, Material, Quiz, Question, Option, User).
- Cấu hình Seed dữ liệu mẫu ban đầu (1-2 môn học mẫu, bài lý thuyết và bộ đề trắc nghiệm có lời giải).

### Giai đoạn 2: Xây dựng Giao diện Học tập & Quiz tương tác
- Xây dựng Layout giao diện: Header, điều hướng danh sách môn học, Breadcrumb.
- Xây dựng trang danh mục Môn học: Chia thành 2 tab trực quan **"Kiến thức trọng tâm"** và **"Luyện đề trắc nghiệm"**.
- Xây dựng màn hình đọc Lý thuyết ôn thi (trình bày đẹp, có mục lục, typography thoáng mắt).
- Hoàn thiện Component Quiz tương tác:
  - Lựa chọn phương án -> Bấm Xác nhận.
  - Logic kiểm tra đúng (chúc mừng, chuyển tiếp) / sai (tô đỏ đáp án chọn, tô xanh đáp án đúng, mở hộp giải thích).
  - Nút chuyển câu và màn hình tổng kết kết quả sau khi hoàn thành toàn bộ đề.

### Giai đoạn 3: Phân hệ Quản trị (Admin Portal)
- Màn hình đăng nhập quản trị viên an toàn.
- Bảng điều khiển quản lý Môn học và Nội dung kiến thức.
- Trình quản lý Đề thi và Câu hỏi:
  - Form thêm/sửa câu hỏi và giải thích.
  - Bộ công cụ Parser hỗ trợ dán văn bản thô để tự động tạo danh sách câu hỏi nhanh chóng.

### Giai đoạn 4: Tinh chỉnh UI/UX, Kiểm thử & Bàn giao
- Kiểm tra toàn diện trên màn hình Desktop, Máy tính bảng và Điện thoại (Responsive).
- Tối ưu tốc độ tải trang, hiệu ứng chuyển động mượt mà.
- Hướng dẫn vận hành và thêm tài liệu cho Admin.
