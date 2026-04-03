import { z } from "zod";

/**
 * Material type enum - supporting markdown, video, and quiz types
 */
export const materialTypeSchema = z.enum(["markdown", "video", "quiz"]);

export const quizQuestionInputSchema = z.object({
  question: z.string().trim().min(1, "Pertanyaan wajib diisi"),
  answer: z.string().trim().min(1, "Jawaban wajib diisi"),
  correctAnswer: z.string().trim().min(1, "Jawaban benar wajib diisi"),
});

export type QuizQuestionInput = z.infer<typeof quizQuestionInputSchema>;

function parseAnswerKeys(answer: string): string[] | null {
  const parts = answer.split("|").map((p) => p.trim());
  if (parts.length < 4) return null;
  if (parts.length % 2 !== 0) return null;

  const keys: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const key = parts[i];
    const text = parts[i + 1];
    if (!key || !text) return null;
    keys.push(key);
  }

  if (keys.length < 2) return null;
  if (new Set(keys).size !== keys.length) return null;
  return keys;
}

/**
 * Client-side form validation schema for creating materials.
 * Supports conditional validation based on material type.
 */
export const materialFormSchema = z
  .object({
      title: z
      .string()
      .trim()
      .min(1, "Judul materi wajib diisi")
      .max(120, "Judul terlalu panjang"),
    type: materialTypeSchema,
    content: z.string().optional(),
    videoUrl: z.string().trim().optional(),
    quizQuestions: z.array(quizQuestionInputSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "markdown") {
        return data.content !== undefined && data.content.trim().length > 0;
      }
      return true;
    },
    {
      message: "Konten wajib diisi untuk materi markdown",
      path: ["content"],
    },
  )
  .refine(
    (data) => {
      if (data.type === "video") {
        if (!data.videoUrl || data.videoUrl.trim().length === 0) {
          return false;
        }
        try {
          new URL(data.videoUrl);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "URL video yang valid wajib diisi untuk materi video",
      path: ["videoUrl"],
    },
  )
  .refine(
    (data) => {
      if (data.type !== "quiz") return true;
      return Array.isArray(data.quizQuestions) && data.quizQuestions.length > 0;
    },
    {
      message: "Minimal 1 pertanyaan kuis wajib ada",
      path: ["quizQuestions"],
    },
  )
  .refine(
    (data) => {
      if (data.type !== "quiz") return true;
      if (!data.quizQuestions) return true;

      return data.quizQuestions.every((q) => {
        const keys = parseAnswerKeys(q.answer);
        if (!keys) return false;
        return keys.includes(q.correctAnswer);
      });
    },
    {
      message:
        "Setiap pertanyaan kuis harus memiliki minimal 2 opsi dan jawaban benar harus cocok dengan salah satu kunci opsi",
      path: ["quizQuestions"],
    },
  );

export type MaterialFormValues = z.infer<typeof materialFormSchema>;

export const createMaterialFormSchema = materialFormSchema.extend({
  chapterId: z.string().uuid(),
});

export type CreateMaterialFormValues = z.infer<typeof createMaterialFormSchema>;

export const updateMaterialFormSchema = materialFormSchema.extend({
  id: z.string().uuid(),
});

export type UpdateMaterialFormValues = z.infer<typeof updateMaterialFormSchema>;
