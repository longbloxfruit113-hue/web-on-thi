export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSubjectBySlug,
  getMaterialsBySubjectId,
  getQuizzesBySubjectId,
  getSubjects,
} from "@/lib/db";
import {
  BookOpen,
  FileText,
  Clock,
  ArrowRight,
  GraduationCap,
  PlayCircle,
  HelpCircle,
  CheckCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default async function SubjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const subject = await getSubjectBySlug(slug);
  if (!subject) {
    notFound();
  }

  const materials = await getMaterialsBySubjectId(subject.id);
  const quizzes = await getQuizzesBySubjectId(subject.id);
  const activeTab = tab ? tab : (materials.length > 0 ? "kien-thuc" : "kiem-tra");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="text-slate-900 font-semibold">{subject.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-200/60">
            <GraduationCap className="w-3.5 h-3.5" />
            Môn học ôn luyện trọng điểm
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {subject.name}
          </h1>
          <p className="mt-3 text-slate-600 text-base leading-relaxed">
            {subject.description || "Tài liệu ôn thi lý thuyết và hệ thống bài kiểm tra trắc nghiệm tương tác."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{materials.length} bài lý thuyết kiến thức</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100">
              <PlayCircle className="w-4 h-4 text-emerald-600" />
              <span>{quizzes.length} bài kiểm tra trắc nghiệm</span>
            </div>
            {quizzes.length > 0 && (
              <Link
                href={`/mon-hoc/${subject.slug}/lam-bai/${quizzes[0].slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Vào làm bài kiểm tra {quizzes[0].title} ngay
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-1">
        <Link
          href={`/mon-hoc/${subject.slug}?tab=kien-thuc`}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "kien-thuc"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Phần Kiến Thức Ôn Thi ({materials.length})
        </Link>

        <Link
          href={`/mon-hoc/${subject.slug}?tab=kiem-tra`}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "kiem-tra"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Bài Kiểm Tra & Quiz ({quizzes.length})
        </Link>
      </div>

      {/* Tab 1: Kiến thức ôn thi */}
      {activeTab === "kien-thuc" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Danh mục tài liệu & kiến thức ôn tập
            </h2>
            <span className="text-xs text-slate-500">
              Nội dung chuẩn do ban quản trị biên soạn
            </span>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Chưa có bài giảng lý thuyết nào cho môn học này.</p>
              <p className="text-xs text-slate-400 mt-1">Admin có thể thêm tài liệu trong trang quản trị.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {materials.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                        Chuyên đề {index + 1}
                      </span>
                      <span className="text-xs text-slate-400">Tài liệu ôn thi</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500 line-clamp-3 leading-relaxed">
                      {item.summary || "Bấm vào để đọc toàn bộ lý thuyết và công thức trọng tâm của bài học."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Đọc ngay • Miễn phí</span>
                    <Link
                      href={`/mon-hoc/${subject.slug}/kien-thuc/${item.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
                    >
                      Xem kiến thức
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bài kiểm tra Quiz */}
      {activeTab === "kiem-tra" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Danh sách bài kiểm tra & luyện đề trắc nghiệm
            </h2>
            <span className="text-xs text-slate-500">
              Cơ chế phản hồi tức thì & giải thích chi tiết
            </span>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <PlayCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Chưa có bài kiểm tra nào cho môn học này.</p>
              <p className="text-xs text-slate-400 mt-1">Admin có thể thêm đề thi trong trang quản trị.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Đề kiểm tra #{index + 1}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{quiz.time_limit || 15} phút</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {quiz.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {quiz.description || "Bộ câu hỏi kiểm tra kiến thức tổng hợp có giải thích sau từng câu."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {quiz.question_count} câu hỏi trắc nghiệm
                    </span>
                    <Link
                      href={`/mon-hoc/${subject.slug}/lam-bai/${quiz.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      Bắt đầu làm bài
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
