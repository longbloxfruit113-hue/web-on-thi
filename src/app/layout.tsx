import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "ÔnThiPro - Nền tảng Ôn thi & Trắc nghiệm tương tác",
  description: "Trang web ôn thi thông minh gồm các môn học, tài liệu lý thuyết và bài kiểm tra trắc nghiệm phản hồi tức thì với giải thích chi tiết.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50/60 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
