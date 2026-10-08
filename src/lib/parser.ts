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

    // Detect standard options: "A.", "A)", "[A]", "A - "
    const optionMatch = line.match(/^([A-D])[\.\)\:\-]\s*(.+)$/i);
    if (optionMatch && currentQuestion) {
      inExplanation = false;
      const key = optionMatch[1].toUpperCase();
      const content = optionMatch[2].trim();
      currentOptions.push({
        key,
        content,
        isCorrect: false,
      });
      continue;
    }

    // Detect correct answer indicator: "Đáp án: A", "Đáp án đúng: B", "Chọn C" hoặc "Đáp án: 40 W" (cho trả lời ngắn)
    const ansMatch = line.match(/^(?:Đáp án|Đáp án đúng|Key|Ans|Chọn)[\:\s\-]+(.+)$/i);
    if (ansMatch && currentQuestion) {
      const ansVal = ansMatch[1].trim();
      // If single letter A-D
      if (/^[A-D]$/i.test(ansVal)) {
        const correctKey = ansVal.toUpperCase();
        currentOptions.forEach((opt) => {
          if (opt.key === correctKey) {
            opt.isCorrect = true;
          }
        });
      } else {
        // Likely a short answer string
        if (currentOptions.length === 0) {
          currentType = "short_answer";
          currentOptions.push({
            key: "ans",
            content: ansVal,
            isCorrect: true,
          });
        }
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
