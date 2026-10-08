export interface ParsedOption {
  key: string;
  content: string;
  isCorrect: boolean;
}

export interface ParsedQuestion {
  content: string;
  options: ParsedOption[];
  explanation: string;
  orderIndex: number;
  type: "multiple_choice" | "true_false" | "short_answer";
}

export function parseRawQuizText(rawText: string): ParsedQuestion[] {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const questions: ParsedQuestion[] = [];

  let currentQuestion: Partial<ParsedQuestion> | null = null;
  let currentOptions: ParsedOption[] = [];
  let currentExplanation = "";
  let inExplanation = false;
  let currentType: "multiple_choice" | "true_false" | "short_answer" = "multiple_choice";

  const flushQuestion = () => {
    if (currentQuestion && currentQuestion.content) {
      // Determine question type if not explicitly set
      let finalType = currentType;
      if (currentOptions.length === 0) {
        finalType = "short_answer";
      } else if (currentOptions.some((o) => ["a", "b", "c", "d"].includes(o.key.toLowerCase()) && (o.content.includes("[Đúng]") || o.content.includes("[Sai]")))) {
        finalType = "true_false";
      }

      if (currentOptions.length >= 1 || finalType === "short_answer") {
        questions.push({
          content: currentQuestion.content,
          options: currentOptions,
          explanation: currentExplanation.trim(),
          orderIndex: questions.length + 1,
          type: finalType,
        });
      }
    }
    currentQuestion = null;
    currentOptions = [];
    currentExplanation = "";
    inExplanation = false;
    currentType = "multiple_choice";
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect question type hint tag: [Đúng/Sai], [Trả lời ngắn], [Trắc nghiệm]
    if (line.match(/^\[?(Đúng\s*[\/\-]\s*Sai|True\s*[\/\-]\s*False)\]?$/i)) {
      currentType = "true_false";
      continue;
    }
    if (line.match(/^\[?(Trả lời ngắn|Điền khuyết|Short Answer)\]?$/i)) {
      currentType = "short_answer";
      continue;
    }

    // Detect new question header: "Câu 1:", "Câu 1.", "1.", "Bài 1:"
    const questionMatch = line.match(/^(?:Câu|Bài|\#)?\s*(\d+)[\.\:\-]\s*(.+)$/i);
    if (questionMatch) {
      flushQuestion();
      currentQuestion = {
        content: questionMatch[2].trim(),
      };
      continue;
    }

    // Detect True/False sub-statement: "a) Mệnh đề... [Đúng]" hoặc "a. Mệnh đề... -> Sai"
    const tfMatch = line.match(/^([a-d])[\.\)\:\-]\s*(.+?)(?:[\s\:\-\>]*(?:\[|\()?)(Đúng|Sai|True|False)(?:\]|\))?$/i);
    if (tfMatch && currentQuestion) {
      inExplanation = false;
      currentType = "true_false";
      const key = tfMatch[1].toLowerCase();
      const statementContent = tfMatch[2].trim();
      const isCorrectValue = tfMatch[3].toLowerCase() === "đúng" || tfMatch[3].toLowerCase() === "true";
      currentOptions.push({
        key,
        content: statementContent,
        isCorrect: isCorrectValue,
      });
      continue;
    }

    // Detect standard options: "A.", "A)", "[A]", "A - ", "*A.", "A. ... (Đúng)", "A. ... *"
    let isOptMarkedCorrect = false;
    let optLine = line;
    if (optLine.startsWith("*")) {
      isOptMarkedCorrect = true;
      optLine = optLine.substring(1).trim();
    }
    if (/\s*\*$/.test(optLine)) {
      isOptMarkedCorrect = true;
      optLine = optLine.replace(/\s*\*$/, "").trim();
    }
    if (/\[x\]/i.test(optLine) || /\(đúng\)/i.test(optLine) || /\[đúng\]/i.test(optLine)) {
      isOptMarkedCorrect = true;
      optLine = optLine.replace(/\[x\]|\(đúng\)|\[đúng\]/gi, "").trim();
    }

    const optionMatch = optLine.match(/^(?:\[([A-D])\]|([A-D])[\.\)\:\-]\s*|([A-D])\s{2,})(.+)$/i);
    if (optionMatch && currentQuestion) {
      inExplanation = false;
      const key = (optionMatch[1] || optionMatch[2] || optionMatch[3]).toUpperCase();
      const content = optionMatch[4].trim();
      currentOptions.push({
        key,
        content,
        isCorrect: isOptMarkedCorrect,
      });
      continue;
    }

    // Detect correct answer indicator:
    // "Đáp án đúng là: A", "Đáp án đúng: A", "Đáp án: A", "Đáp án chính xác: A", "Chọn: A", "Chọn A", "Key: A", "Ans: A", "Câu trả lời đúng: A"
    const ansMatch = line.match(/^(?:Đáp án đúng là|Đáp án đúng|Đáp án chính xác|Đáp án|Câu trả lời đúng|Key|Ans|Chọn)[\:\s\-\.\=]+(.+)$/i);
    if (ansMatch && currentQuestion) {
      const rawAnsVal = ansMatch[1].trim();

      // Check if it starts with letter A-D (e.g. "A", "A.", "(A)", "[A]", "A - Nội dung", "A: Nội dung")
      const letterMatch = rawAnsVal.match(/^\(?\[?([A-D])(?:\.|\)|\:|\-|\s|\]|$)/i);
      if (letterMatch && currentOptions.length > 0) {
        const correctKey = letterMatch[1].toUpperCase();
        currentOptions.forEach((opt) => {
          if (opt.key === correctKey) {
            opt.isCorrect = true;
          }
        });
      } else if (currentOptions.length > 0) {
        // Maybe multiple letters: "A, C"
        const letters = rawAnsVal.match(/\b([A-D])\b/gi);
        if (letters && letters.length > 0) {
          const letterSet = new Set(letters.map((l) => l.toUpperCase()));
          currentOptions.forEach((opt) => {
            if (letterSet.has(opt.key)) {
              opt.isCorrect = true;
            }
          });
        } else {
          // Check if user wrote the exact option content instead of letter
          const normalizedAns = rawAnsVal.toLowerCase().replace(/[\.\,\;\:\s]/g, "");
          const matchedOpt = currentOptions.find((opt) => 
            opt.content.toLowerCase().replace(/[\.\,\;\:\s]/g, "") === normalizedAns
          );
          if (matchedOpt) {
            matchedOpt.isCorrect = true;
          }
        }
      } else {
        // Likely a short answer string (no options parsed yet)
        currentType = "short_answer";
        currentOptions.push({
          key: "ans",
          content: rawAnsVal,
          isCorrect: true,
        });
      }
      continue;
    }

    // Detect explanation indicator: "Giải thích:", "Lời giải:", "Hướng dẫn giải:"
    const expMatch = line.match(/^(?:Giải thích|Lời giải|Hướng dẫn giải|Lý do|Căn cứ)[\:\s\-]+(.*)$/i);
    if (expMatch && currentQuestion) {
      inExplanation = true;
      currentExplanation += (expMatch[1] ? expMatch[1] + " " : "");
      continue;
    }

    // Continuation line
    if (inExplanation) {
      currentExplanation += line + " ";
    } else if (currentOptions.length > 0) {
      const last = currentOptions[currentOptions.length - 1];
      last.content += " " + line;
    } else if (currentQuestion) {
      currentQuestion.content += " " + line;
    }
  }

  flushQuestion();
  return questions;
}
