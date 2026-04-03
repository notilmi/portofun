"use client";

import { EyeIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizViewer from "@/app/learning-center/dashboard/_components/quiz-viewer";

export type QuizQuestionLike = {
  question: string;
  answer: string;
  correctAnswer: string;
};

type QuizPreviewDialogProps = {
  questions: QuizQuestionLike[];
  disabled?: boolean;
};

export default function QuizPreviewDialog({
  questions,
  disabled,
}: QuizPreviewDialogProps) {
  const [open, setOpen] = useState(false);

  const isDisabled = useMemo(
    () => disabled ?? questions.length === 0,
    [disabled, questions.length],
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isDisabled}
        onClick={() => setOpen(true)}
      >
        <EyeIcon />
        Pratinjau Kuis
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pratinjau Kuis</DialogTitle>
            <DialogDescription>
              Pratinjau ini menggunakan pertanyaan yang ada saat ini di formulir
              (belum tentu tersimpan).
            </DialogDescription>
          </DialogHeader>

          <QuizViewer questions={questions} submitLabel="Selesai Pratinjau" />
        </DialogContent>
      </Dialog>
    </>
  );
}
