"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  BookOpen,
  FileText,
  CheckCircle,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Trash2,
  Lock,
  Layers,
  Code,
  Check,
  AlertCircle,
  FileQuestion,
  RefreshCw,
} from "lucide-react";
import { MathText } from "@/components/MathText";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"parser" | "materials" | "quizzes" | "manual" | "subjects">("parser");

  // Data states
  const [subjects, setSubjects] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");

  // Status message
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states: New Subject
  const [newSubName, setNewSubName] = useState("");
  const [newSubSlug, setNewSubSlug] = useState("");
  const [newSubDesc, setNewSubDesc] = useState("");
  const [newSubColor, setNewSubColor] = useState("blue");

  // Form states: New Material
  const [matSubjectId, setMatSubjectId] = useState("");
  const [matTitle, setMatTitle] = useState("");
  const [matSlug, setMatSlug] = useState("");
  const [matSummary, setMatSummary] = useState("");
  const [matContent, setMatContent] = useState("");

  // Form states: New Quiz
  const [quizSubjectId, setQuizSubjectId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizSlug, setQuizSlug] = useState("");
  const [quizTimeLimit, setQuizTimeLimit] = useState(15);
  const [quizDesc, setQuizDesc] = useState("");

  // Form states: Batch Parser (User requested: web processes info & turns it into quiz)
  const [rawText, setRawText] = useState("");
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Form states: Manual Question
  const [manualQuizId, setManualQuizId] = useState("");
  const [manualType, setManualType] = useState<"multiple_choice" | "true_false" | "short_answer">("multiple_choice");
  const [manualContent, setManualContent] = useState("");
  const [manualExplanation, setManualExplanation] = useState("");
  const [manualShortAnswer, setManualShortAnswer] = useState("");
  const [manualOptions, setManualOptions] = useState([
    { content: "", isCorrect: true },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ]);
  const [manualTfStatements, setManualTfStatements] = useState([
    { content: "", isCorrect: true },
    { content: "", isCorrect: false },
    { content: "", isCorrect: true },
    { content: "", isCorrect: false },
  ]);

  // Load Initial Data
  const loadInitialData = async () => {
    try {
      const subRes = await fetch("/api/subjects");
      const subData = await subRes.json();
      if (subData.success) {
        setSubjects(subData.data);
        if (subData.data.length > 0) {
          setSelectedSubjectId(subData.data[0].id);
          setMatSubjectId(subData.data[0].id);
          setQuizSubjectId(subData.data[0].id);
        }
      }

      const quizRes = await fetch("/api/quizzes");
      const quizData = await quizRes.json();
      if (quizData.success) {
        setQuizzes(quizData.data);
        if (quizData.data.length > 0) {
          setSelectedQuizId(quizData.data[0].id);
          setManualQuizId(quizData.data[0].id);
        }
      }

      const matRes = await fetch("/api/materials");
      const matData = await matRes.json();
      if (matData.success) {
        setMaterials(matData.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài kiểm tra "${quizTitle}" không? Mọi câu hỏi thuộc đề này sẽ bị xóa.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/quizzes?id=${quizId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message || "Đã xóa bài kiểm tra thành công!");
        loadInitialData();
      } else {
        showToast("error", data.error || "Không thể xóa bài kiểm tra");
      }
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  const handleDeleteMaterial = async (matId: string, matTitle: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài liệu kiến thức "${matTitle}" không?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/materials?id=${matId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message || "Đã xóa tài liệu lý thuyết thành công!");
        loadInitialData();
      } else {
        showToast("error", data.error || "Không thể xóa tài liệu");
      }
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  useEffect(() => {
    // Check if session token in local storage
    const logged = sessionStorage.getItem("admin_logged");
    if (logged === "true") {
      setIsAuthenticated(true);
      loadInitialData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "nguyenhailongdz2012" && password === "@Longg435.") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_logged", "true");
      setLoginError("");
      loadInitialData();
    } else {
      setLoginError("Tên đăng nhập hoặc mật khẩu không chính xác");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_logged");
  };

  const showToast = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // 1. Submit New Subject
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubName,
          slug: newSubSlug,
          description: newSubDesc,
          color: newSubColor,
          icon: "BookOpen",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Đã thêm môn học "${newSubName}" thành công!`);
        setNewSubName("");
        setNewSubSlug("");
        setNewSubDesc("");
        loadInitialData();
      } else {
        showToast("error", data.error || "Lỗi khi thêm môn học");
      }
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // 2. Submit New Study Material
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: matSubjectId,
          title: matTitle,
          slug: matSlug,
          summary: matSummary,
          content: matContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Đã lưu tài liệu kiến thức ôn thi: "${matTitle}"!`);
        setMatTitle("");
        setMatSlug("");
        setMatSummary("");
        setMatContent("");
      } else {
        showToast("error", data.error || "Lỗi khi lưu tài liệu");
      }
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // 3. Submit New Quiz
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: quizSubjectId,
          title: quizTitle,
          slug: quizSlug,
          description: quizDesc,
          timeLimit: quizTimeLimit,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Đã tạo đề kiểm tra: "${quizTitle}"! Giờ bạn có thể nạp câu hỏi.`);
        setQuizTitle("");
        setQuizSlug("");
        setQuizDesc("");
        loadInitialData();
      } else {
        showToast("error", data.error || "Lỗi khi tạo đề kiểm tra");
      }
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // 4. Batch Parser: Preview
  const handlePreviewParse = async () => {
    if (!rawText.trim()) {
      showToast("error", "Vui lòng dán nội dung tài liệu câu hỏi vào ô nhập liệu!");
      return;
    }

    setIsParsing(true);
    try {
      const res = await fetch("/api/admin/parse-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          saveDirectly: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setParsedPreview(data.data);
        showToast("success", `Xử lý thông tin thành công! Tìm thấy ${data.count} câu hỏi hợp lệ.`);
      } else {
        showToast("error", data.error || "Không thể bóc tách câu hỏi");
      }
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // 5. Batch Parser: Save into Quiz
  const handleSaveBatchToQuiz = async () => {
    if (!selectedQuizId) {
      showToast("error", "Vui lòng chọn bài kiểm tra đích để nạp câu hỏi vào!");
      return;
    }
    if (!rawText.trim()) {
      showToast("error", "Vui lòng dán nội dung tài liệu câu hỏi!");
      return;
    }

    setIsParsing(true);
    try {
      const res = await fetch("/api/admin/parse-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          quizId: selectedQuizId,
          saveDirectly: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message || "Đã nạp toàn bộ câu hỏi vào bài kiểm tra thành công!");
        setRawText("");
        setParsedPreview([]);
        loadInitialData();
      } else {
        showToast("error", data.error || "Lỗi khi lưu câu hỏi");
      }
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // 6. Manual Question Form
  const handleManualQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuizId) {
      showToast("error", "Vui lòng chọn bài kiểm tra!");
      return;
    }

    let submitOptions = manualOptions;
    if (manualType === "true_false") {
      submitOptions = manualTfStatements;
    } else if (manualType === "short_answer") {
      if (!manualShortAnswer.trim()) {
        showToast("error", "Vui lòng nhập đáp án chuẩn cho câu trả lời ngắn!");
        return;
      }
      submitOptions = [{ content: manualShortAnswer.trim(), isCorrect: true }];
    }

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: manualQuizId,
          content: manualContent,
          explanation: manualExplanation,
          options: submitOptions,
          type: manualType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Đã thêm câu hỏi vào bài kiểm tra thành công!");
        setManualContent("");
        setManualExplanation("");
        setManualShortAnswer("");
        setManualOptions([
          { content: "", isCorrect: true },
          { content: "", isCorrect: false },
          { content: "", isCorrect: false },
          { content: "", isCorrect: false },
        ]);
        setManualTfStatements([
          { content: "", isCorrect: true },
          { content: "", isCorrect: false },
          { content: "", isCorrect: true },
          { content: "", isCorrect: false },
        ]);
        loadInitialData();
      } else {
        showToast("error", data.error || "Lỗi khi thêm câu hỏi");
      }
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Sample batch text template
  const loadSampleBatchText = () => {
    const sample = `--- DẠNG 1: TRẮC NGHIỆM NHIỀU LỰA CHỌN ---
Câu 1: Chiến thắng Điện Biên Phủ diễn ra vào năm nào?
A. 1945
B. 1954
C. 1975
D. 1986
Đáp án: B
Giải thích: Chiến thắng Điện Biên Phủ diễn ra ngày 7/5/1954, kết thúc thắng lợi cuộc kháng chiến chống Pháp.

--- DẠNG 2: TRẮC NGHIỆM ĐÚNG / SAI ---
Câu 2: Xét tính đúng/sai của các phát biểu sau về động năng và thế năng:
a) Động năng chỉ phụ thuộc vào khối lượng của vật [Sai]
b) Thế năng phụ thuộc vào khối lượng và độ cao của vật [Đúng]
c) Khi rơi tự do, thế năng chuyển hóa thành động năng [Đúng]
d) Cơ năng không được bảo toàn khi không có ma sát [Sai]
Giải thích: Động năng phụ thuộc cả khối lượng và vận tốc: W_đ = 0.5*m*v^2.

--- DẠNG 3: TRẮC NGHIỆM TRẢ LỜI NGẮN ---
Câu 3: Một cần cẩu thực hiện công 12000 J trong thời gian 30 giây. Công suất hoạt động của cần cẩu là bao nhiêu Watt (W)?
Đáp án: 400
Giải thích: Công suất P = A / t = 12000 / 30 = 400 W.`;
    setRawText(sample);
  };

  // -------------------------------------------------------------
  // If not authenticated: Show Login Form
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Đăng Nhập Quản Trị Viên</h2>
          <p className="text-xs text-slate-500 mt-1">
            Quyền thêm tài liệu kiến thức ôn thi & nạp đề trắc nghiệm
          </p>

          {loginError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tài khoản Admin
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên tài khoản admin"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu admin"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-xs"
            >
              Đăng nhập trang quản trị
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Authenticated Admin Dashboard
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Hệ Thống Quản Trị Admin ÔnThiPro
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Bảng điều khiển Quản Trị
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Thêm tài liệu ôn thi, biên soạn câu hỏi và sử dụng bộ xử lý thông tin tự động tạo Quiz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadInitialData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-sm animate-in fade-in duration-200 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Admin Nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("parser")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "parser"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          ⚡ Xử lý thông tin tự động tạo Quiz
        </button>

        <button
          onClick={() => setActiveTab("materials")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "materials"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Thêm Kiến Thức Ôn Thi
        </button>

        <button
          onClick={() => setActiveTab("quizzes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "quizzes"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          Tạo Đề Kiểm Tra Mới
        </button>

        <button
          onClick={() => setActiveTab("manual")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "manual"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Soạn Câu Hỏi Thủ Công
        </button>

        <button
          onClick={() => setActiveTab("subjects")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "subjects"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          Quản Lý Môn Học
        </button>
      </div>

      {/* TAB 1: BATCH PARSER (Tự động xử lý thông tin biến thành dạng quiz) */}
      {activeTab === "parser" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Bộ Xử Lý Thông Tin & Biến Thành Dạng Quiz Tự Động
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Chỉ cần dán nội dung câu hỏi kèm các lựa chọn (A, B, C, D), đáp án và lời giải thích vào đây. Hệ thống sẽ bóc tách và tự động tạo thành đề thi trắc nghiệm hoàn chỉnh.
                </p>
              </div>

              <button
                type="button"
                onClick={loadSampleBatchText}
                className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 border border-blue-200 shrink-0"
              >
                + Điền dữ liệu mẫu để thử
              </button>
            </div>

            {/* Select Destination Quiz */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Chọn Bài kiểm tra đích để nạp câu hỏi vào:
                  </label>
                  {selectedQuizId && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = quizzes.find((q) => q.id === selectedQuizId);
                        if (target) handleDeleteQuiz(target.id, target.title);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 transition-colors"
                      title="Xóa bài kiểm tra đang chọn"
                    >
                      <Trash2 className="w-3 h-3" />
                      Xóa đề này
                    </button>
                  )}
                </div>
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.subject_name || "Môn"} - {q.title} ({q.question_count} câu)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center text-xs text-slate-500">
                <span>
                  💡 Sau khi nạp, các câu hỏi sẽ lập tức hiển thị trên trang làm bài với đầy đủ cơ chế chọn đáp án, báo đúng/sai và hiện giải thích!
                </span>
              </div>
            </div>

            {/* Raw Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dán văn bản câu hỏi, lựa chọn, đáp án và giải thích vào đây:
              </label>
              <textarea
                rows={12}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Ví dụ định dạng chuẩn:\n\nCâu 1: Thủ đô nước Pháp là thành phố nào?\nA. Luân Đôn\nB. Berlin\nC. Paris\nD. Madrid\nĐáp án: C\nGiải thích: Paris là thủ đô và thành phố đông dân nhất nước Pháp.\n\nCâu 2: Số nguyên tố chẵn duy nhất là số nào?\nA. 0\nB. 2\nC. 4\nD. 6\nĐáp án: B\nGiải thích: Số 2 là số nguyên tố chẵn duy nhất, tất cả các số chẵn khác đều chia hết cho 2 nên là hợp số.`}
                className="w-full font-mono text-sm p-4 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handlePreviewParse}
                disabled={isParsing}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                1. Phân tích & Xem trước kết quả bóc tách
              </button>

              <button
                type="button"
                onClick={handleSaveBatchToQuiz}
                disabled={isParsing || !selectedQuizId}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
              >
                <CheckCircle className="w-4 h-4" />
                2. Nạp trực tiếp vào Bài kiểm tra ngay!
              </button>
            </div>
          </div>

          {/* Preview Parsed Questions Section */}
          {parsedPreview.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Kết quả xem trước ({parsedPreview.length} câu hỏi đã được xử lý):
              </h4>

              <div className="space-y-4">
                {parsedPreview.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
                        Câu {idx + 1}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.options.length} phương án lựa chọn
                      </span>
                    </div>

                    <div className="font-semibold text-slate-900 text-base">
                      <MathText content={item.content} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {item.options.map((opt: any, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            opt.isCorrect
                              ? "bg-emerald-50 border-emerald-400 text-emerald-900 font-medium"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className="font-bold text-xs">{opt.key}.</span>
                          <MathText content={opt.content} />
                          {opt.isCorrect && (
                            <span className="ml-auto text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                              Đúng
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {item.explanation && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <span className="font-bold shrink-0">Giải thích:</span>
                        <MathText content={item.explanation} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: THÊM KIẾN THỨC ÔN THI (Tài liệu lý thuyết cho từng môn) */}
      {activeTab === "materials" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Thêm Bài Giảng & Nội Dung Kiến Thức Ôn Thi
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Học sinh khi ấn vào môn học sẽ thấy các nội dung ôn tập lý thuyết bạn cung cấp tại đây.
            </p>
          </div>

          <form onSubmit={handleCreateMaterial} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn môn học *
                </label>
                <select
                  value={matSubjectId}
                  onChange={(e) => setMatSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề bài học / chuyên đề *
                </label>
                <input
                  type="text"
                  value={matTitle}
                  onChange={(e) => {
                    setMatTitle(e.target.value);
                    if (!matSlug) {
                      setMatSlug(
                        e.target.value
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[đĐ]/g, "d")
                          .replace(/[^a-z0-9]/g, "-")
                          .replace(/-+/g, "-")
                      );
                    }
                  }}
                  placeholder="Ví dụ: Tổng hợp công thức Tích phân & Ứng dụng"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn Slug (URL) *
                </label>
                <input
                  type="text"
                  value={matSlug}
                  onChange={(e) => setMatSlug(e.target.value)}
                  placeholder="tong-hop-cong-thuc-tich-phan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tóm tắt ngắn gọn
                </label>
                <input
                  type="text"
                  value={matSummary}
                  onChange={(e) => setMatSummary(e.target.value)}
                  placeholder="Tóm lược nội dung chính trong 1-2 câu"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nội dung bài học chi tiết (Hỗ trợ định dạng ### Tiêu đề, gạch đầu dòng - ) *
              </label>
              <textarea
                rows={10}
                value={matContent}
                onChange={(e) => setMatContent(e.target.value)}
                placeholder={`### 1. Định nghĩa\nNội dung giải thích...\n\n### 2. Các công thức cần nhớ\n- Công thức 1: ...\n- Công thức 2: ...\n\n---`}
                className="w-full font-sans text-sm p-4 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-blue-500 leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-xs"
            >
              Lưu bài học lý thuyết
            </button>
          </form>

          {/* Current materials list with Delete Action */}
          <div className="pt-8 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center justify-between">
              <span>Danh Sách Tài Liệu Kiến Thức Hiện Có ({materials.length})</span>
            </h4>
            
            {materials.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có bài học lý thuyết nào.</p>
            ) : (
              <div className="space-y-3">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                          {mat.subject_name || "Môn học"}
                        </span>
                        <h5 className="font-semibold text-slate-900 text-sm">{mat.title}</h5>
                      </div>
                      {mat.summary && (
                        <p className="text-xs text-slate-500 line-clamp-1">{mat.summary}</p>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">Slug: /{mat.slug}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Xóa tài liệu này"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        Xóa tài liệu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TẠO ĐỀ KIỂM TRA MỚI */}
      {activeTab === "quizzes" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-blue-600" />
              Tạo Bài Kiểm Tra & Đề Thi Mới
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tạo khung đề thi cho môn học trước khi nạp ngân hàng câu hỏi.
            </p>
          </div>

          <form onSubmit={handleCreateQuiz} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn môn học *
              </label>
              <select
                value={quizSubjectId}
                onChange={(e) => setQuizSubjectId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                required
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên bài kiểm tra *
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => {
                  setQuizTitle(e.target.value);
                  if (!quizSlug) {
                    setQuizSlug(
                      e.target.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[đĐ]/g, "d")
                        .replace(/[^a-z0-9]/g, "-")
                        .replace(/-+/g, "-")
                    );
                  }
                }}
                placeholder="Ví dụ: Đề ôn thi học kỳ I - Mức độ Vận dụng"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn Slug (URL) *
                </label>
                <input
                  type="text"
                  value={quizSlug}
                  onChange={(e) => setQuizSlug(e.target.value)}
                  placeholder="de-on-thi-hoc-ky-1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thời gian làm bài (Phút)
                </label>
                <input
                  type="number"
                  value={quizTimeLimit}
                  onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả đề thi
              </label>
              <textarea
                rows={3}
                value={quizDesc}
                onChange={(e) => setQuizDesc(e.target.value)}
                placeholder="Mô tả phạm vi kiến thức kiểm tra..."
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-xs"
            >
              Tạo bài kiểm tra
            </button>
          </form>

          {/* Current quizzes list with Delete Action */}
          <div className="pt-8 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center justify-between">
              <span>Danh Sách Bài Kiểm Tra Hiện Có ({quizzes.length})</span>
            </h4>
            
            {quizzes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có bài kiểm tra nào.</p>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                          {quiz.subject_name || "Môn học"}
                        </span>
                        <h5 className="font-semibold text-slate-900 text-sm">{quiz.title}</h5>
                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          {quiz.question_count || 0} câu hỏi
                        </span>
                      </div>
                      {quiz.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{quiz.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>Thời gian: {quiz.time_limit} phút</span>
                        <span>•</span>
                        <span>Slug: /{quiz.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Xóa bài kiểm tra này"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        Xóa đề thi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SOẠN CÂU HỎI THỦ CÔNG */}
      {activeTab === "manual" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Soạn Từng Câu Hỏi Thủ Công
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Nhập nội dung câu hỏi, 4 phương án lựa chọn, tích chọn đáp án đúng và viết lời giải thích.
            </p>
          </div>

          <form onSubmit={handleManualQuestionSubmit} className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn bài kiểm tra *
              </label>
              <select
                value={manualQuizId}
                onChange={(e) => setManualQuizId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                required
              >
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dạng câu hỏi trắc nghiệm *
              </label>
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="multiple_choice">1. Trắc nghiệm 4 lựa chọn (A, B, C, D)</option>
                <option value="true_false">2. Trắc nghiệm Đúng / Sai (Đánh giá các mệnh đề a, b, c, d)</option>
                <option value="short_answer">3. Trắc nghiệm Trả lời ngắn (Điền đáp án, kết quả, số liệu)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nội dung câu hỏi *
              </label>
              <textarea
                rows={3}
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                placeholder={
                  manualType === "multiple_choice"
                    ? "Ví dụ: Đạo hàm của hàm số y = x^2 là gì?"
                    : manualType === "true_false"
                    ? "Ví dụ: Xét tính đúng hoặc sai của các mệnh đề sau về cơ năng:"
                    : "Ví dụ: Một vật có công 1200J thực hiện trong 30s. Tính công suất (W) của vật."
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* DẠNG 1: 4 Options (Multiple Choice) */}
            {manualType === "multiple_choice" && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Các phương án lựa chọn (Tích chọn tròn ở ô đáp án đúng):
                </label>

                {manualOptions.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={opt.isCorrect}
                        onChange={() => {
                          const newOpts = manualOptions.map((o, i) => ({
                            ...o,
                            isCorrect: i === idx,
                          }));
                          setManualOptions(newOpts);
                        }}
                        className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="w-8 font-bold text-sm text-slate-600">{letter}.</span>
                      <input
                        type="text"
                        value={opt.content}
                        onChange={(e) => {
                          const newOpts = [...manualOptions];
                          newOpts[idx].content = e.target.value;
                          setManualOptions(newOpts);
                        }}
                        placeholder={`Nội dung phương án ${letter}`}
                        className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                        required={manualType === "multiple_choice"}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* DẠNG 2: True / False Statements */}
            {manualType === "true_false" && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Các mệnh đề con (Tích chọn Đúng hoặc Sai tương ứng với mỗi ý):
                </label>

                {manualTfStatements.map((opt, idx) => {
                  const letter = String.fromCharCode(97 + idx); // a, b, c, d
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="w-6 font-bold text-sm text-slate-700">{letter})</span>
                      <input
                        type="text"
                        value={opt.content}
                        onChange={(e) => {
                          const newStmts = [...manualTfStatements];
                          newStmts[idx].content = e.target.value;
                          setManualTfStatements(newStmts);
                        }}
                        placeholder={`Nội dung mệnh đề ${letter}...`}
                        className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-500"
                        required={manualType === "true_false"}
                      />

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const newStmts = [...manualTfStatements];
                            newStmts[idx].isCorrect = true;
                            setManualTfStatements(newStmts);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            opt.isCorrect
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-white text-slate-600 border border-slate-300"
                          }`}
                        >
                          Đúng
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newStmts = [...manualTfStatements];
                            newStmts[idx].isCorrect = false;
                            setManualTfStatements(newStmts);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            !opt.isCorrect
                              ? "bg-rose-600 text-white shadow-xs"
                              : "bg-white text-slate-600 border border-slate-300"
                          }`}
                        >
                          Sai
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DẠNG 3: Short Answer */}
            {manualType === "short_answer" && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Đáp án chuẩn xác (Hệ thống sẽ đối chiếu câu trả lời của học sinh với đáp án này) *
                </label>
                <input
                  type="text"
                  value={manualShortAnswer}
                  onChange={(e) => setManualShortAnswer(e.target.value)}
                  placeholder="Ví dụ: 40 hoặc 40 W hoặc Oát..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 font-semibold text-emerald-800"
                  required={manualType === "short_answer"}
                />
                <span className="text-[11px] text-slate-400 block">
                  💡 Hệ thống tự động so khớp không phân biệt chữ hoa/thường và khoảng trắng thừa.
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lời giải thích lí do chi tiết (Hiện khi học sinh làm sai hoặc xem lại bài) *
              </label>
              <textarea
                rows={3}
                value={manualExplanation}
                onChange={(e) => setManualExplanation(e.target.value)}
                placeholder="Giải thích vì sao đáp án đó đúng, chỉ ra bẫy hoặc phương pháp giải..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-xs"
            >
              Lưu câu hỏi vào bài kiểm tra
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: QUẢN LÝ MÔN HỌC */}
      {activeTab === "subjects" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Thêm & Quản Lý Môn Học
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Thêm các môn học mới vào hệ thống ôn luyện.
            </p>
          </div>

          <form onSubmit={handleCreateSubject} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên môn học *
                </label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => {
                    setNewSubName(e.target.value);
                    if (!newSubSlug) {
                      setNewSubSlug(
                        e.target.value
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[đĐ]/g, "d")
                          .replace(/[^a-z0-9]/g, "-")
                          .replace(/-+/g, "-")
                      );
                    }
                  }}
                  placeholder="Ví dụ: Hóa Học, Sinh Học..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn Slug (URL) *
                </label>
                <input
                  type="text"
                  value={newSubSlug}
                  onChange={(e) => setNewSubSlug(e.target.value)}
                  placeholder="hoa-hoc"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả môn học
              </label>
              <textarea
                rows={2}
                value={newSubDesc}
                onChange={(e) => setNewSubDesc(e.target.value)}
                placeholder="Tóm tắt chương trình môn học..."
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tông màu chủ đạo
              </label>
              <select
                value={newSubColor}
                onChange={(e) => setNewSubColor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="blue">Xanh dương (Blue)</option>
                <option value="emerald">Xanh lá (Emerald)</option>
                <option value="violet">Tím (Violet)</option>
                <option value="amber">Vàng hổ phách (Amber)</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-xs"
            >
              Thêm môn học mới
            </button>
          </form>

          {/* Current subjects list */}
          <div className="pt-6 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm mb-3">Danh sách các môn học hiện có ({subjects.length}):</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {subjects.map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-sm">{sub.name}</span>
                  <span className="text-xs text-slate-400 font-mono">/{sub.slug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
