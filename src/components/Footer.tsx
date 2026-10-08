import Link from "next/link";
import { GraduationCap, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">ÔnThiPro — Nền tảng Ôn thi & Trắc nghiệm Tương tác</p>
              <p className="text-xs text-slate-500">Hệ thống câu hỏi chọn lọc, giải thích chi tiết, ôn tập lý thuyết chuẩn xác</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Trang chủ
            </Link>
            <Link href="/admin" className="hover:text-blue-600 transition-colors">
              Cổng Quản trị Admin
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} ÔnThiPro. Thiết kế sáng, hiện đại, tối ưu cho học sinh & giáo viên.</p>
          <p className="flex items-center gap-1">
            Xây dựng với <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> và Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
