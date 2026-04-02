"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import QuizResults, { type QuizAttempt, type QuizQuestionLike } from "./quiz-results";
import { parseQuizAnswer } from "./quiz.utils";

type QuizViewerProps = {
  questions: Array<{
    question: string;
    answer: string;
    correctAnswer?: string;
  }>;
  className?: string;
  submitLabel?: string;
  onSubmit?: (answers: (string | undefined)[]) => boolean | void | Promise<boolean | void>;
  onRetry?: () => void;
  disableSubmit?: boolean;
  showResults?: boolean;
};

function canRenderResults(questions: QuizViewerProps["questions"]): questions is QuizQuestionLike[] {
  return questions.every(
    (q) => typeof q.correctAnswer === "string" && q.correctAnswer.trim().length > 0,
  );
}

export default function QuizViewer({
  questions,
  className,
  submitLabel = "Submit",
  onSubmit,
  onRetry,
  disableSubmit = false,
  showResults = true,
}: QuizViewerProps) {
  const [attempt, setAttempt] = useState<QuizAttempt>({ answers: [] });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const normalized = useMemo(() => {
    return questions.map((q) => ({
      question: q.question,
      options: parseQuizAnswer(q.answer),
    }));
  }, [questions]);

  const setAnswer = (index: number, key: string) => {
    setAttempt((prev) => {
      const next = [...(prev.answers ?? [])];
      next[index] = key;
      return { answers: next };
    });
  };

  const handleSubmit = async () => {
    setIsWorking(true);

    try {
      const ok = onSubmit ? await onSubmit(attempt.answers) : true;
      if (ok === false) {
        return;
      }

      setIsSubmitted(true);
    } finally {
      setIsWorking(false);
    }
  };

  const handleRetry = () => {
    setAttempt({ answers: [] });
    setIsSubmitted(false);
    onRetry?.();
  };

  if (questions.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border bg-muted/20 px-3 py-3 text-sm text-muted-foreground",
          className,
        )}
      >
        No questions to preview.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {!isSubmitted ? (
        <>
          <div className="space-y-3">
            {normalized.map((q, idx) => (
              <div key={idx} className="rounded-lg border p-3">
                <p className="text-sm font-medium">
                  Q{idx + 1}. {q.question}
                </p>

                <div className="mt-3 space-y-2">
                  {q.options.map((opt) => {
                    const selected = attempt.answers[idx] === opt.key;
                    return (
                      <label
                        key={opt.key}
                        className={cn(
                          "flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm",
                          selected
                            ? "border-primary/40 bg-primary/5"
                            : "border-border",
                        )}
                      >
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          checked={selected}
                          onChange={() => setAnswer(idx, opt.key)}
                          className="mt-0.5"
                        />
                        <span className="min-w-0">
                          <span className="text-muted-foreground">{opt.key}.</span> {opt.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={disableSubmit || isWorking}
            >
              {submitLabel}
            </Button>
          </div>
        </>
      ) : (
        <>
          {showResults && canRenderResults(questions) ? (
            <QuizResults questions={questions} attempt={attempt} />
          ) : (
            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              Submitted.
            </div>
          )}

          <div className="flex items-center justify-end">
            <Button type="button" variant="outline" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
