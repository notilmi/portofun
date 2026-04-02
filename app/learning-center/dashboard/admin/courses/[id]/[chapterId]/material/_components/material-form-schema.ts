import { z } from "zod";

/**
 * Material type enum - supporting markdown, video, and quiz types
 */
export const materialTypeSchema = z.enum(["markdown", "video", "quiz"]);

export const quizQuestionInputSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
  answer: z.string().trim().min(1, "Answer is required"),
  correctAnswer: z.string().trim().min(1, "Correct answer is required"),
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
      .min(1, "Material title is required")
      .max(120, "Title is too long"),
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
      message: "Content is required for markdown materials",
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
      message: "Valid video URL is required for video materials",
      path: ["videoUrl"],
    },
  )
  .refine(
    (data) => {
      if (data.type !== "quiz") return true;
      return Array.isArray(data.quizQuestions) && data.quizQuestions.length > 0;
    },
    {
      message: "At least 1 quiz question is required",
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
        "Each quiz question must have 2+ options and the correct answer must match one of the option keys",
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
