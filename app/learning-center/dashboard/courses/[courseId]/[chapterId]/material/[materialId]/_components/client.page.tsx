"use client";

import { useMemo, useState } from "react";

import QuizViewer from "@/app/learning-center/dashboard/_components/quiz-viewer";
import {
  validateQuizAndComplete,
} from "@/server/actions/learning-center/progress.actions";

type ActionError = { error: string; code: string };

function isActionError(value: unknown): value is ActionError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string" &&
    "code" in value &&
    typeof (value as { code?: unknown }).code === "string"
  );
}

type ClientPageProps = {
  userId: string;
  material: {
    id: string;
    title: string;
    quizQuestions: Array<{
      id: string;
      question: string;
      answer: string;
      correctAnswer: string;
    }>;
  };
};

export default function ClientPage({ material, userId }: ClientPageProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = useMemo(() => {
    return material.quizQuestions.map((q) => ({
      question: q.question,
      answer: q.answer,
    }));
  }, [material.quizQuestions]);

  const handleSubmit = async (answers: (string | undefined)[]) => {
    setFeedback(null);

    const hasEmpty = answers.some((a, idx) => {
      if (idx >= material.quizQuestions.length) return false;
      return !a || a.trim().length === 0;
    });
    if (hasEmpty) {
      setFeedback("Please answer all questions.");
      return false;
    }

    setIsSubmitting(true);

    try {
      const response = await validateQuizAndComplete({
        userId,
        materialId: material.id,
        answers: material.quizQuestions.map((q, idx) => ({
          questionId: q.id,
          answer: answers[idx] ?? "",
        })),
      });

      if (isActionError(response)) {
        if (response.code === "QUIZ_INCORRECT") {
          setFeedback("Incorrect. Try again.");
          return false;
        }

        setFeedback(response.error);
        return false;
      }

      setFeedback("Correct! Material completed.");
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setFeedback(null);
  };

  return (
    <div className="space-y-4">
      {feedback ? (
        <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm">{feedback}</div>
      ) : null}

      <QuizViewer
        questions={questions}
        submitLabel={isSubmitting ? "Submitting..." : "Submit"}
        disableSubmit={isSubmitting}
        onSubmit={handleSubmit}
        onRetry={handleRetry}
        showResults={false}
      />
    </div>
  );
}
