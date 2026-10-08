import { notFound } from "next/navigation";
import Link from "next/link";
import { getSubjectBySlug, getQuizBySlug } from "@/lib/db";
import { InteractiveQuizRoom } from "@/components/InteractiveQuizRoom";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default async function TakeQuizPage({
  params,
}: {
  params: Promise<{ slug: string; quizSlug: string }>;
}) {
  const { slug, quizSlug } = await params;

  const subject = getSubjectBySlug(slug);
  if (!subject) notFound();

  const quiz = getQuizBySlug(subject.id, quizSlug);
  if (!quiz) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb / Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link href={`/mon-hoc/${subject.slug}`} className="hover:text-blue-600 transition-colors">
            {subject.name}
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-semibold line-clamp-1">{quiz.title}</span>
        </nav>

        <Link
          href={`/mon-hoc/${subject.slug}?tab=kiem-tra`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại danh sách đề thi
        </Link>
      </div>

      {/* Render the interactive engine */}
      <InteractiveQuizRoom quiz={quiz} subject={subject} />
    </div>
  );
}
