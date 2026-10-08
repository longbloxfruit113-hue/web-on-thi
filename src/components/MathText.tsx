"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathTextProps {
  content: string;
  className?: string;
  as?: "span" | "div" | "p";
}

export function MathText({ content, className = "", as: Component = "span" }: MathTextProps) {
  const htmlContent = useMemo(() => {
    if (!content) return "";

    let processed = content;

    // Convert common physics expressions without $ into $...$
    // e.g., P=A/t -> \mathcal{P} = \frac{A}{t}
    // Wđ=1/2.m.v^2 -> W_đ = \frac{1}{2}mv^2
    // Wt=P.h=10.m.h -> W_t = P \cdot h = 10mh
    // A=F.s -> A = F \cdot s
    // Wt = 10mh -> W_t = 10mh
    processed = processed
      .replace(/\b(P|P_cs)\s*=\s*A\/t\b/gi, "$\\mathcal{P} = \\frac{A}{t}$")
      .replace(/\(P=A\/t\)/gi, "($\\mathcal{P} = \\frac{A}{t}$)")
      .replace(/Wđ\s*=\s*1\/2\.m\.v\^2/gi, "$W_đ = \\frac{1}{2}mv^2$")
      .replace(/\(Wđ=1\/2\.m\.v\^2\)/gi, "($W_đ = \\frac{1}{2}mv^2$)")
      .replace(/Wt\s*=\s*P\.h\s*=\s*10\.m\.h/gi, "$W_t = P \\cdot h = 10mh$")
      .replace(/Wt\s*=\s*10mh/gi, "$W_t = 10mh$")
      .replace(/\bA\s*=\s*F\.s\b/gi, "$A = F \\cdot s$")
      .replace(/\(A=F\.s\)/gi, "($A = F \\cdot s$)")
      .replace(/(\b2\^2\s*=\s*4\b)/gi, "$2^2 = 4$");

    // 1. Process explicit LaTeX $$...$$ and $...$
    // Note: Do NOT use regex.test() beforehand as it advances lastIndex on /g regex
    const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    let hasMath = false;

    processed = processed.replace(mathRegex, (match) => {
      const isDisplay = match.startsWith("$$");
      const formula = isDisplay ? match.slice(2, -2).trim() : match.slice(1, -1).trim();

      // Check if this matched accidental plain Vietnamese text across broken dollar signs
      // If it contains multiple common Vietnamese words with spaces and no \text, don't treat as math
      if (!isDisplay && /\s/.test(formula) && /\b(trong|khoảng|thời|gian|của|vật|với|khi|được|nghiệm|phát|biểu|sau|đây)\b/i.test(formula) && !formula.includes("\\text")) {
        return match;
      }

      try {
        hasMath = true;
        return katex.renderToString(formula, {
          displayMode: isDisplay,
          throwOnError: false,
        });
      } catch {
        return match;
      }
    });

    // Clean up any remaining stray \text{...} in regular text
    processed = processed.replace(/\\text\{([^}]+)\}/g, "$1");

    if (hasMath) {
      return processed;
    }

    // 2. If no $ was found, but the whole string is an equation/math formula (like in options: "y' = 4x^3 - 4x", "y = 2", "x = -1", "Wt = mv^2/2", "A = F/s")
    const isPureFormula =
      /^(\s*[a-zA-Z_0-9'\(\)\s]+\s*[\=]\s*[a-zA-Z_0-9\+\-\*\/\^\(\)\.\s]+|\s*y'\s*=.*|\s*W[td]\s*=.*|\s*[A-Z]\s*=.*)$/.test(
        processed.trim()
      );

    if (isPureFormula) {
      let formula = processed.trim();
      // Format simple division into fractions if simple: mv^2/2 -> \frac{mv^2}{2}, F/s -> \frac{F}{s}
      formula = formula
        .replace(/([a-zA-Z0-9\^]+)\/([a-zA-Z0-9]+)/g, "\\frac{$1}{$2}")
        .replace(/\.s\b/g, " \\cdot s")
        .replace(/\bpi\b/g, "\\pi");

      try {
        return katex.renderToString(formula, {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return processed;
      }
    }

    return processed;
  }, [content]);

  return (
    <Component
      className={`font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
