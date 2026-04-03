"use client";

import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { parseQuizAnswer } from "./quiz-question-utils";
import QuizQuestionForm, { type QuizQuestionInput } from "./quiz-question-form";

type QuizQuestionsEditorProps = {
  value: QuizQuestionInput[];
  onChange: (next: QuizQuestionInput[]) => void;
  error?: string;
};

function questionSummary(q: QuizQuestionInput): string {
  const options = parseQuizAnswer(q.answer);
  const correct = q.correctAnswer;
  const correctText = options.find((o) => o.key === correct)?.text;
    if (correctText) return `Benar: ${correct}. ${correctText}`;
    if (correct) return `Benar: ${correct}`;
  return "";
}

export default function QuizQuestionsEditor({ value, onChange, error }: QuizQuestionsEditorProps) {
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const editingInitial = useMemo(() => {
    if (editingIndex == null) return undefined;
    const existing = value[editingIndex];
    if (!existing) return undefined;

    const options = parseQuizAnswer(existing.answer);
    const correctIndex = Math.max(
      0,
      options.findIndex((o) => o.key === existing.correctAnswer),
    );

    return {
      question: existing.question,
      options: options.map((o) => ({ text: o.text })),
      correctIndex,
    };
  }, [editingIndex, value]);

  const startAdd = () => {
    setEditingIndex(null);
    setOpen(true);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setOpen(true);
  };

  const handleSave = async (q: QuizQuestionInput): Promise<boolean> => {
    if (editingIndex == null) {
      onChange([...value, q]);
    } else {
      const next = [...value];
      next[editingIndex] = q;
      onChange(next);
    }

    setOpen(false);
    setEditingIndex(null);
    return true;
  };

  const handleDelete = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Pertanyaan Kuis</p>
          <p className="text-xs text-muted-foreground">
            Tambahkan minimal 1 pertanyaan. Setiap pertanyaan harus memiliki 2–10 opsi.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={startAdd}>
          <PlusIcon />
          Tambah Pertanyaan
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {value.length === 0 ? (
        <div className="rounded-lg border bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
          Belum ada pertanyaan.
        </div>
      ) : (
        <div className="rounded-lg border">
          {value.map((q, idx) => (
            <div key={idx} className="px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Q{idx + 1}. {q.question}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {questionSummary(q)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => startEdit(idx)}
                     aria-label={`Ubah pertanyaan ${idx + 1}`}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(idx)}
                     aria-label={`Hapus pertanyaan ${idx + 1}`}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </div>
              {idx !== value.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
               {editingIndex == null ? "Tambah Pertanyaan" : "Ubah Pertanyaan"}
            </DialogTitle>
            <DialogDescription>
              Tentukan pertanyaan, opsi, dan opsi mana yang benar.
            </DialogDescription>
          </DialogHeader>

          <QuizQuestionForm
            initialValues={editingInitial}
            onCancel={() => {
              setOpen(false);
              setEditingIndex(null);
            }}
            onSubmit={handleSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
