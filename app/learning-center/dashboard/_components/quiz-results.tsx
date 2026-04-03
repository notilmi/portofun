"use client";

import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { parseQuizAnswer } from "./quiz.utils";

export type QuizQuestionLike = {
  question: string;
  answer: string;
  correctAnswer: string;
};

export type QuizAttempt = {
  answers: (string | undefined)[];
};

type QuizResultsProps = {
  questions: QuizQuestionLike[];
  attempt: QuizAttempt;
  className?: string;
};

function optionText(answer: string, key: string | undefined): string | undefined {
  if (!key) return undefined;
  return parseQuizAnswer(answer).find((o) => o.key === key)?.text;
}

export default function QuizResults({ questions, attempt, className }: QuizResultsProps) {
  const total = questions.length;
  const correct = questions.reduce((acc, q, idx) => {
    const selected = attempt.answers[idx];
    return acc + (selected === q.correctAnswer ? 1 : 0);
  }, 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border bg-muted/20 px-3 py-2">
         <p className="text-sm font-medium">Hasil</p>
         <p className="text-sm text-muted-foreground">
           Nilai: <span className="font-medium text-foreground">{correct}</span> / {total}
         </p>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => {
          const selected = attempt.answers[idx];
          const isCorrect = selected === q.correctAnswer;
          const selectedText = optionText(q.answer, selected);
          const correctText = optionText(q.answer, q.correctAnswer);

          return (
            <div key={idx} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Q{idx + 1}. {q.question}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                     Jawaban Anda: {selected ? `${selected}. ${selectedText ?? ""}` : "(kosong)"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Jawaban benar: {q.correctAnswer}. {correctText ?? ""}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-full border px-2 py-1 text-xs",
                    isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-destructive/30 bg-destructive/10 text-destructive",
                  )}
                >
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckIcon className="size-3" /> Benar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <XIcon className="size-3" /> Salah
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
