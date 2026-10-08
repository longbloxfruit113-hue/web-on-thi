export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSubjectBySlug,
  getMaterialBySlug,
  getMaterialsBySubjectId,
} from "@/lib/db";
import {
  BookOpen,
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ArrowRight,
  FileText,
} from "lucide-react";
import { MathText } from "@/components/MathText";

export default async function StudyMaterialReaderPage({
  params,
}: {
  params: Promise<{ slug: string; materialSlug: string }>;
}) {
  const { slug, materialSlug } = await params;

  const subject = getSubjectBySlug(slug);
  if (!subject) notFound();

  const material = getMaterialBySlug(subject.id, materialSlug);
  if (!material) notFound();

  const otherMaterials = getMaterialsBySubjectId(subject.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <Link href={`/mon-hoc/${subject.slug}`} className="hover:text-blue-600 transition-colors">
          {subject.name}
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="text-slate-900 font-semibold line-clamp-1">{material.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Article Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-200/60">
              <BookOpen className="w-3.5 h-3.5" />
              Tài liệu ôn thi chính thức • {subject.name}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {material.title}
            </h1>

            {material.summary && (
              <p className="mt-4 text-slate-600 text-base sm:text-lg border-l-4 border-blue-500 pl-4 py-1 italic bg-blue-50/40 rounded-r-xl">
                {material.summary}
              </p>
            )}

            {/* Content Body */}
            <div className="mt-8 pt-8 border-t border-slate-100 text-slate-800 leading-relaxed space-y-6 font-sans text-base">
              {material.content.split("\n\n").map((block: string, idx: number) => {
                if (block.startsWith("### ")) {
                  return (
                    <h3
                      key={idx}
                      className="text-xl font-bold text-slate-900 pt-4 pb-1 border-b border-slate-100 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      {block.replace("### ", "")}
                    </h3>
                  );
                }
                if (block.startsWith("---")) {
                  return <hr key={idx} className="my-6 border-slate-200" />;
                }
                if (block.startsWith("- ")) {
                  return (
                    <ul key={idx} className="list-disc list-inside space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                      {block.split("\n").map((item, itemIdx) => (
                        <li key={itemIdx} className="text-slate-700 leading-relaxed">
                          <MathText content={item.replace(/^- /, "")} />
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <div key={idx} className="whitespace-pre-line text-slate-700 leading-relaxed">
                    <MathText content={block} />
                  </div>
                );
              })}
            </div>

            {/* Bottom action to take quiz */}
            <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
              <div>
                <h4 className="font-bold text-slate-900">Đã nắm chắc lý thuyết này?</h4>
                <p className="text-xs text-slate-600 mt-1">Luyện bài tập trắc nghiệm để kiểm tra mức độ hiểu bài ngay lập tức.</p>
              </div>
              <Link
                href={`/mon-hoc/${subject.slug}?tab=kiem-tra`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-xs shrink-0"
              >
                Vào làm bài kiểm tra
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar: Other topics in subject */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-24">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-blue-600" />
              Bài học cùng môn ({otherMaterials.length})
            </h3>

            <div className="space-y-2">
              {otherMaterials.map((item, idx) => {
                const isCurrent = item.slug === material.slug;
                return (
                  <Link
                    key={item.id}
                    href={`/mon-hoc/${subject.slug}/kien-thuc/${item.slug}`}
                    className={`block p-3 rounded-xl text-sm transition-all ${
                      isCurrent
                        ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-slate-400 mt-0.5">{idx + 1}.</span>
                      <span className="line-clamp-2">{item.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href={`/mon-hoc/${subject.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay lại tổng quan môn {subject.name}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
