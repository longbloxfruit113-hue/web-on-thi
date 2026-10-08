"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Check,
  X,
  Shuffle,
  Volume2,
  VolumeX,
  HelpCircle as QuestionIcon,
} from "lucide-react";
import { MathText } from "@/components/MathText";
import { playQuizFeedback, initAudio } from "@/lib/soundEffects";

interface Option {
  id: string;
  question_id: string;
  content: string;
  is_correct: number;
}

interface Question {
  id: string;
  quiz_id: string;
  content: string;
  explanation: string;
  order_index: number;
  type?: "multiple_choice" | "true_false" | "short_answer";
  options: Option[];
}

interface Quiz {
  id: string;
  subject_id: string;
  title: string;
  slug: string;
  description: string;
  time_limit: number;
  questions: Question[];
}

interface Subject {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  quiz: Quiz;
  subject: Subject;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Function to shuffle questions AND their options
function prepareShuffledQuestions(rawQuestions: Question[]): Question[] {
  // 1. Shuffle order of questions
  const shuffledQuestions = shuffleArray(rawQuestions);

  // 2. For multiple_choice questions, shuffle their options
  return shuffledQuestions.map((q) => {
    const qType = q.type || "multiple_choice";
    if (qType === "multiple_choice" && q.options && q.options.length > 1) {
      return {
        ...q,
        type: qType,
        options: shuffleArray(q.options),
      };
    }
    return {
      ...q,
      type: qType,
    };
  });
}

// Helper to normalize strings for short answer comparison
function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/,/g, ".") // Treat 0,5 as 0.5
    .replace(/[^\w\d\.\-\+áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/gi, "");
}

export function InteractiveQuizRoom({ quiz, subject }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answer states for the CURRENT question:
  // For multiple_choice: optionId selected
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // For true_false: statementId -> boolean (true = chọn Đúng, false = chọn Sai)
  const [tfSelections, setTfSelections] = useState<Record<string, boolean>>({});

  // For short_answer: text input value
  const [shortAnswerInput, setShortAnswerInput] = useState<string>("");

  const [isConfirmed, setIsConfirmed] = useState(false);

  // Global user answers record: questionId -> answer info
  const [userAnswers, setUserAnswers] = useState<
    Record<
      string,
      {
        type: "multiple_choice" | "true_false" | "short_answer";
        isCorrect: boolean;
        // extra info for review
        selectedOptionId?: string;
        tfSelections?: Record<string, boolean>;
        shortAnswerInput?: string;
        expectedAnswer?: string;
      }
    >
  >({});

  const [isFinished, setIsFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize and shuffle on component mount
  useEffect(() => {
    initAudio();
    if (quiz.questions && quiz.questions.length > 0) {
      const prepared = prepareShuffledQuestions(quiz.questions);
      setQuestions(prepared);
    }
  }, [quiz.questions]);

  const currentQuestion = questions[currentIndex];
  const qType = currentQuestion?.type || "multiple_choice";

  // Check if current question has an answer ready to confirm
  const canConfirm = () => {
    if (isConfirmed || !currentQuestion) return false;
    if (qType === "multiple_choice") {
      return Boolean(selectedOptionId);
    }
    if (qType === "true_false") {
      // Must answer all statements
      return (
        currentQuestion.options.length > 0 &&
        currentQuestion.options.every((opt) => tfSelections[opt.id] !== undefined)
      );
    }
    if (qType === "short_answer") {
      return shortAnswerInput.trim().length > 0;
    }
    return false;
  };

  const handleConfirm = () => {
    if (!canConfirm()) return;

    setIsConfirmed(true);

    let isThisQuestionCorrect = false;

    if (qType === "multiple_choice") {
      const selectedOption = currentQuestion.options.find((opt) => opt.id === selectedOptionId);
      isThisQuestionCorrect = selectedOption ? Boolean(selectedOption.is_correct) : false;

      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          type: "multiple_choice",
          isCorrect: isThisQuestionCorrect,
          selectedOptionId: selectedOptionId || undefined,
        },
      }));
    } else if (qType === "true_false") {
      // Check every statement: statement is correct if (selected === true && opt.is_correct == 1) OR (selected === false && opt.is_correct == 0)
      let allCorrect = true;
      for (const opt of currentQuestion.options) {
        const userChoice = tfSelections[opt.id];
        const actualCorrect = Boolean(opt.is_correct);
        if (userChoice !== actualCorrect) {
          allCorrect = false;
        }
      }
      isThisQuestionCorrect = allCorrect;

      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          type: "true_false",
          isCorrect: allCorrect,
          tfSelections: { ...tfSelections },
        },
      }));
    } else if (qType === "short_answer") {
      const normInput = normalizeAnswer(shortAnswerInput);
      // Check against any option marked correct or option content
      const matched = currentQuestion.options.some((opt) => {
        const normExpected = normalizeAnswer(opt.content);
        return normInput === normExpected;
      });
      isThisQuestionCorrect = matched;

      const firstExpected = currentQuestion.options[0]?.content || "";

      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          type: "short_answer",
          isCorrect: matched,
          shortAnswerInput: shortAnswerInput.trim(),
          expectedAnswer: firstExpected,
        },
      }));
    }

    // Play lively sound effect ("ting" or buzz) and voice ("tốt tốt" or "sai rồi con tuất")
    playQuizFeedback(isThisQuestionCorrect, isMuted);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setTfSelections({});
      setShortAnswerInput("");
      setIsConfirmed(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    // Re-shuffle both questions and options
    if (quiz.questions && quiz.questions.length > 0) {
      const prepared = prepareShuffledQuestions(quiz.questions);
      setQuestions(prepared);
    }
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setTfSelections({});
    setShortAnswerInput("");
    setIsConfirmed(false);
    setUserAnswers({});
    setIsFinished(false);
  };

  // If no questions in quiz
  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Đang chuẩn bị đề thi...</h2>
        <p className="text-sm text-slate-500 mt-2">Hệ thống đang xáo trộn câu hỏi và đáp án cho bạn.</p>
        <Link
          href={`/mon-hoc/${subject.slug}`}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm"
        >
          Quay lại môn {subject.name}
        </Link>
      </div>
    );
  }

  // Calculate score when finished
  const totalQuestions = questions.length;
  const correctCount = Object.values(userAnswers).filter((ans) => ans.isCorrect).length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  // ------------------------------------------------------------------
  // FINISHED SCREEN (Kết quả & Xem lại chi tiết cả 3 định dạng)
  // ------------------------------------------------------------------
  if (isFinished) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/20 mb-6">
            <Award className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Hoàn Thành Bài Kiểm Tra!
          </h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            {quiz.title} • {subject.name}
          </p>

          <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-md mx-auto grid grid-cols-2 gap-4">
            <div className="text-center border-r border-slate-200">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Số câu đúng</span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                {correctCount} <span className="text-sm text-slate-400 font-normal">/ {totalQuestions}</span>
              </p>
            </div>
            <div className="text-center">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Điểm số</span>
              <p className="text-3xl font-extrabold text-blue-600 mt-1">
                {scorePercent}%
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleRestartQuiz}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              Làm lại bài (Đảo câu hỏi & đáp án mới)
            </button>
            <Link
              href={`/mon-hoc/${subject.slug}?tab=kien-thuc`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 font-semibold text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              Ôn lại lý thuyết môn này
            </Link>
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Xem lại chi tiết từng câu hỏi & lời giải
          </h3>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const ans = userAnswers[q.id];
              const isUserCorrect = ans ? ans.isCorrect : false;
              const thisType = q.type || "multiple_choice";

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl bg-white border transition-all ${
                    isUserCorrect ? "border-emerald-200" : "border-rose-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                        Câu {idx + 1}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                        {thisType === "multiple_choice"
                          ? "Nhiều lựa chọn"
                          : thisType === "true_false"
                          ? "Đúng / Sai"
                          : "Trả lời ngắn"}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        isUserCorrect
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isUserCorrect ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Đúng
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" /> Sai
                        </>
                      )}
                    </span>
                  </div>

                  <MathText content={q.content} className="mt-3 font-semibold text-slate-900 text-base block" as="div" />

                  {/* 1. Review Multiple Choice */}
                  {thisType === "multiple_choice" && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {q.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        const isCorrectOpt = Boolean(opt.is_correct);
                        const isUserSelected = ans && ans.selectedOptionId === opt.id;

                        let optClass = "border-slate-200 bg-slate-50/50 text-slate-700";
                        if (isCorrectOpt) {
                          optClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium";
                        } else if (isUserSelected && !isCorrectOpt) {
                          optClass = "border-rose-500 bg-rose-50 text-rose-900 line-through";
                        }

                        return (
                          <div key={opt.id} className={`p-3 rounded-xl border flex items-center gap-2 ${optClass}`}>
                            <span className="font-bold text-xs shrink-0">{letter}.</span>
                            <MathText content={opt.content} className="flex-1" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. Review True / False */}
                  {thisType === "true_false" && (
                    <div className="mt-4 space-y-2 text-sm">
                      {q.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(97 + oIdx); // a, b, c, d
                        const userChoice = ans?.tfSelections ? ans.tfSelections[opt.id] : undefined;
                        const actualCorrect = Boolean(opt.is_correct);
                        const isThisStmtCorrect = userChoice === actualCorrect;

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              isThisStmtCorrect ? "border-emerald-200 bg-emerald-50/40" : "border-rose-200 bg-rose-50/40"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-xs shrink-0 mt-0.5">{letter})</span>
                              <MathText content={opt.content} className="flex-1" />
                            </div>

                            <div className="flex items-center gap-3 shrink-0 text-xs">
                              <span className="text-slate-500">
                                Bạn chọn:{" "}
                                <strong className={userChoice ? "text-blue-600" : "text-amber-600"}>
                                  {userChoice === undefined ? "Chưa chọn" : userChoice ? "ĐÚNG" : "SAI"}
                                </strong>
                              </span>
                              <span className="font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200">
                                Đáp án:{" "}
                                <strong className={actualCorrect ? "text-emerald-700" : "text-rose-700"}>
                                  {actualCorrect ? "ĐÚNG" : "SAI"}
                                </strong>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 3. Review Short Answer */}
                  {thisType === "short_answer" && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Câu trả lời của bạn:</span>
                        <strong className={isUserCorrect ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                          {ans?.shortAnswerInput || "(Chưa nhập)"}
                        </strong>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Đáp án chuẩn:</span>
                        <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <MathText content={ans?.expectedAnswer || q.options[0]?.content || ""} />
                        </span>
                      </div>
                    </div>
                  )}

                  {q.explanation && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Giải thích: </span>
                        <MathText content={q.explanation} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // ACTIVE QUIZ VIEW
  // ------------------------------------------------------------------
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Check correctness of current question for feedback display
  let isCurrentCorrect = false;
  if (isConfirmed) {
    if (qType === "multiple_choice") {
      const selected = currentQuestion.options.find((opt) => opt.id === selectedOptionId);
      isCurrentCorrect = selected ? Boolean(selected.is_correct) : false;
    } else if (qType === "true_false") {
      isCurrentCorrect = currentQuestion.options.every((opt) => {
        return tfSelections[opt.id] === Boolean(opt.is_correct);
      });
    } else if (qType === "short_answer") {
      const normInput = normalizeAnswer(shortAnswerInput);
      isCurrentCorrect = currentQuestion.options.some((opt) => {
        return normInput === normalizeAnswer(opt.content);
      });
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Top Header & Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mb-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{subject.name} • {quiz.title}</span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]">
              <Shuffle className="w-3 h-3 text-slate-400" />
              Đã đảo câu hỏi & đáp án
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                !isMuted
                  ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
              }`}
              title="Bật / tắt âm thanh và giọng đọc vui nhộn"
            >
              {!isMuted ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>Âm thanh & Giọng đọc: BẬT</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>Âm thanh: TẮT</span>
                </>
              )}
            </button>

            <span className="font-bold text-blue-600 shrink-0">
              Câu {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">
              <Sparkles className="w-3.5 h-3.5" />
              Câu hỏi số {currentIndex + 1}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
              {qType === "multiple_choice" && "Trắc nghiệm 4 lựa chọn"}
              {qType === "true_false" && "Trắc nghiệm Đúng / Sai"}
              {qType === "short_answer" && "Trắc nghiệm Trả lời ngắn"}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            <MathText content={currentQuestion.content} />
          </h2>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DẠNG 1: MULTIPLE CHOICE (Nhiều lựa chọn)                      */}
        {/* ------------------------------------------------------------- */}
        {qType === "multiple_choice" && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOptionId === option.id;
              const isCorrectOption = Boolean(option.is_correct);

              let cardStyle =
                "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 text-slate-800 cursor-pointer";
              let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";

              if (!isConfirmed) {
                if (isSelected) {
                  cardStyle =
                    "border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-2 ring-blue-500/20";
                  badgeStyle = "bg-blue-600 text-white border-blue-600";
                }
              } else {
                if (isCorrectOption) {
                  cardStyle =
                    "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30 shadow-xs";
                  badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                } else if (isSelected && !isCorrectOption) {
                  cardStyle =
                    "border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/30 shadow-xs";
                  badgeStyle = "bg-rose-600 text-white border-rose-600";
                } else {
                  cardStyle = "border-slate-200 bg-slate-50/40 text-slate-400 opacity-60";
                  badgeStyle = "bg-slate-100 text-slate-400 border-slate-200";
                }
              }

              return (
                <div
                  key={option.id}
                  onClick={() => {
                    if (!isConfirmed) setSelectedOptionId(option.id);
                  }}
                  className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border transition-all text-base font-normal select-none ${cardStyle}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 transition-all ${badgeStyle}`}
                  >
                    {letter}
                  </div>

                  <div className="flex-1 leading-relaxed text-base">
                    <MathText content={option.content} />
                  </div>

                  {isConfirmed && (
                    <div className="shrink-0">
                      {isCorrectOption ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-in zoom-in-50 duration-200" />
                      ) : isSelected && !isCorrectOption ? (
                        <XCircle className="w-6 h-6 text-rose-600 animate-in zoom-in-50 duration-200" />
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* DẠNG 2: TRUE / FALSE (Đúng / Sai)                             */}
        {/* ------------------------------------------------------------- */}
        {qType === "true_false" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              * Chọn <strong className="text-emerald-700">Đúng</strong> hoặc <strong className="text-rose-700">Sai</strong> cho từng mệnh đề dưới đây:
            </p>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const letter = String.fromCharCode(97 + idx); // a, b, c, d
                const userChoice = tfSelections[option.id];
                const actualCorrect = Boolean(option.is_correct);
                const isStmtCorrect = userChoice === actualCorrect;

                return (
                  <div
                    key={option.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      !isConfirmed
                        ? "border-slate-200 bg-white"
                        : isStmtCorrect
                        ? "border-emerald-300 bg-emerald-50/30"
                        : "border-rose-300 bg-rose-50/30"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {letter}
                        </span>
                        <div className="text-base text-slate-800 leading-relaxed">
                          <MathText content={option.content} />
                        </div>
                      </div>

                      {/* True / False Toggle Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          disabled={isConfirmed}
                          onClick={() => {
                            setTfSelections((prev) => ({ ...prev, [option.id]: true }));
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            userChoice === true
                              ? "bg-emerald-600 text-white shadow-xs scale-105"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          } ${isConfirmed ? "cursor-default" : "cursor-pointer"}`}
                        >
                          Đúng
                        </button>

                        <button
                          type="button"
                          disabled={isConfirmed}
                          onClick={() => {
                            setTfSelections((prev) => ({ ...prev, [option.id]: false }));
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            userChoice === false
                              ? "bg-rose-600 text-white shadow-xs scale-105"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          } ${isConfirmed ? "cursor-default" : "cursor-pointer"}`}
                        >
                          Sai
                        </button>

                        {/* Confirmation Icon */}
                        {isConfirmed && (
                          <div className="ml-2">
                            {isStmtCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Show explanation hint for this statement after confirmation if wrong */}
                    {isConfirmed && !isStmtCorrect && (
                      <div className="mt-3 pt-3 border-t border-rose-200/60 text-xs text-rose-700 font-medium flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-rose-600" />
                        Đáp án chính xác: <strong className="uppercase">{actualCorrect ? "Đúng" : "Sai"}</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* DẠNG 3: SHORT ANSWER (Trả lời ngắn)                           */}
        {/* ------------------------------------------------------------- */}
        {qType === "short_answer" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              * Điền câu trả lời ngắn gọn (số liệu, công thức hoặc từ khóa) vào ô trống bên dưới:
            </p>

            <div className="space-y-3">
              <input
                type="text"
                disabled={isConfirmed}
                value={shortAnswerInput}
                onChange={(e) => setShortAnswerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canConfirm()) {
                    handleConfirm();
                  }
                }}
                placeholder="Nhập đáp án của bạn (ví dụ: 40, 15m, Oát...)..."
                className={`w-full px-5 py-4 rounded-2xl border text-base font-medium transition-all ${
                  !isConfirmed
                    ? "border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                    : isCurrentCorrect
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
                    : "border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20"
                }`}
              />

              {isConfirmed && !isCurrentCorrect && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Đáp án đúng là:{" "}
                    <strong className="text-emerald-700 text-sm font-bold ml-1">
                      <MathText content={currentQuestion.options[0]?.content || ""} />
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ACTION BUTTON: Xác nhận hoặc Chuyển câu                       */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            {!isConfirmed
              ? qType === "multiple_choice"
                ? "Chọn 1 đáp án và bấm Xác nhận"
                : qType === "true_false"
                ? "Chọn Đúng/Sai cho tất cả các ý và bấm Xác nhận"
                : "Nhập câu trả lời và bấm Xác nhận"
              : isCurrentCorrect
              ? "Tuyệt vời! Bạn đã trả lời đúng."
              : "Xem kĩ phần giải thích bên dưới để củng cố kiến thức."}
          </span>

          {!isConfirmed ? (
            <button
              onClick={handleConfirm}
              disabled={!canConfirm()}
              className={`ml-auto inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                canConfirm()
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              <span>Xác nhận đáp án</span>
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className={`ml-auto inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all text-white cursor-pointer ${
                isCurrentCorrect
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 hover:shadow-lg"
                  : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
              }`}
            >
              <span>
                {currentIndex < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả bài kiểm tra"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* FEEDBACK & EXPLANATION CARD                                   */}
        {/* ------------------------------------------------------------- */}
        {isConfirmed && (
          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-3 duration-300">
            {isCurrentCorrect ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/40 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-900 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-700 flex items-center justify-center shrink-0 text-2xl shadow-xs">
                    🎉
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-base text-emerald-900">&quot;Tốt, tốt!&quot; — Quá chuẩn!</h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 uppercase tracking-wide">
                        Chính xác
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      Giọng khen ngợi &quot;Tốt tốt&quot; và tiếng ting chúc mừng vừa vang lên!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playQuizFeedback(true, false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                  title="Nghe lại giọng đọc"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nghe lại</span>
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50/40 border border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-rose-900 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-rose-100 border border-rose-200 rounded-2xl text-rose-700 flex items-center justify-center shrink-0 text-2xl shadow-xs">
                    🐶
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-base text-rose-900">&quot;Sai rồi con tuất!&quot; 😂</h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 uppercase tracking-wide">
                        Chưa đúng
                      </span>
                    </div>
                    <p className="text-xs text-rose-700 mt-1">
                      Đừng nản lòng nhé! Xem kĩ giải thích và căn cứ kiến thức bên dưới để phục thù câu sau.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playQuizFeedback(false, false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 text-xs font-bold hover:bg-rose-50 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                  title="Nghe lại giọng đọc"
                >
                  <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Nghe lại</span>
                </button>
              </div>
            )}

            {currentQuestion.explanation && (
              <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>💡 Giải thích lí do & Căn cứ kiến thức:</span>
                </div>
                <div className="text-sm leading-relaxed text-amber-900/90 pl-6">
                  <MathText content={currentQuestion.explanation} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
