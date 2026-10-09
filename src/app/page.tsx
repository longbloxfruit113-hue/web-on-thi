export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { getSubjects } from "@/lib/db";
import {
  BookOpen,
  Calculator,
  Languages,
  Atom,
  Landmark,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  GraduationCap,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";

// Map string icon names to Lucide icon components
const iconMap: Record<string, any> = {
  Calculator: Calculator,
  Languages: Languages,
  Atom: Atom,
  Landmark: Landmark,
  BookOpen: BookOpen,
};

// Color styles mapping for subject badges & cards
const colorStyles: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue: {
    bg: "hover:border-blue-300 bg-white shadow-xs hover:shadow-md",
    text: "text-blue-600",
    border: "border-blue-100",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  emerald: {
    bg: "hover:border-emerald-300 bg-white shadow-xs hover:shadow-md",
    text: "text-emerald-600",
    border: "border-emerald-100",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  violet: {
    bg: "hover:border-violet-300 bg-white shadow-xs hover:shadow-md",
    text: "text-violet-600",
    border: "border-violet-100",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
  },
  amber: {
    bg: "hover:border-amber-300 bg-white shadow-xs hover:shadow-md",
    text: "text-amber-600",
    border: "border-amber-100",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export default async function HomePage() {
  const subjects = (await getSubjects()) as any[];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-transparent pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-6 border border-blue-200/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            Nền tảng Ôn thi Trắc nghiệm & Lý thuyết 2026
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Ôn luyện kiến thức,{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Chinh phục điểm cao
            </span>{" "}
            với phản hồi tức thì
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Học tập theo từng môn học chuyên sâu. Làm bài kiểm tra trắc nghiệm thông minh: đúng nhận thông báo chính xác, sai xem ngay đáp án chuẩn và lời giải thích chi tiết.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#danh-sach-mon-hoc"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-500/25 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5"
            >
              <GraduationCap className="w-4 h-4" />
              Chọn Môn Học & Ôn Tập
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-700 font-semibold text-sm border border-slate-200 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              Khu vực Quản trị (Admin)
            </Link>
          </div>

          {/* Quick Features Row */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Phản hồi tức thì</p>
                <p className="text-xs text-slate-500 mt-0.5">Biết ngay đúng/sai sau mỗi câu bấm xác nhận</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Giải thích chi tiết</p>
                <p className="text-xs text-slate-500 mt-0.5">Lời giải cụ thể giúp hiểu sâu bản chất vấn đề</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Kho lý thuyết môn</p>
                <p className="text-xs text-slate-500 mt-0.5">Tóm tắt công thức và trọng tâm ôn thi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="danh-sach-mon-hoc" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              Môn Học Trọng Tâm
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Chọn môn học để bắt đầu ôn tập
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-sm">
            Mỗi môn học gồm 2 phần: <span className="font-semibold text-slate-700">Kiến thức ôn thi</span> và <span className="font-semibold text-slate-700">Bộ đề kiểm tra trắc nghiệm</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((subject) => {
            const Icon = iconMap[subject.icon] || BookOpen;
            const style = colorStyles[subject.color] || colorStyles.blue;

            return (
              <div
                key={subject.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 group ${style.bg}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-slate-50 border ${style.border} flex items-center justify-center ${style.text} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${style.badge}`}>
                      {subject.quiz_count} đề thi
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {subject.description || "Nội dung ôn luyện và các bài kiểm tra trắc nghiệm."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {subject.material_count} bài lý thuyết
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Luyện đề 15p
                    </span>
                  </div>

                  <Link
                    href={`/mon-hoc/${subject.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-blue-600 transition-colors shadow-xs"
                  >
                    Vào phòng học
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Flow Demonstration Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-xl relative">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-4">
              Cơ chế làm bài thông minh
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
              Trải nghiệm Quiz học tập: Chọn đáp án → Xác nhận → Hiển thị kết quả & Lời giải thích ngay lập tức!
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Không cần phải chờ tới hết bài mới biết mình sai ở đâu. Với mỗi câu hỏi, khi bạn làm đúng, hệ thống sẽ chúc mừng và chuyển câu; nếu sai, hệ thống cảnh báo đỏ và lập tức mở hộp thoại lý giải căn cứ để bạn khắc sâu kiến thức.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/mon-hoc/vat-ly/lam-bai/de-kiem-tra-vat-li-9"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 transition-colors shadow-md"
              >
                Trải nghiệm thử đề Vật lí 9 ngay
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/mon-hoc/lich-su/lam-bai/de-kiem-tra-lich-su-9"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20"
              >
                Trải nghiệm thử đề Lịch sử 9
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
