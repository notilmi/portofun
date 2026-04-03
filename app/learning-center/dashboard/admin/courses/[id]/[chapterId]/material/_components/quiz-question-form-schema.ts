import { z } from "zod";

export const quizOptionSchema = z.object({
  text: z.string().trim().min(1, "Teks opsi wajib diisi"),
});

export const quizQuestionFormSchema = z
  .object({
    question: z.string().trim().min(1, "Pertanyaan wajib diisi"),
    options: z
      .array(quizOptionSchema)
      .min(2, "Minimal 2 opsi wajib ada")
      .max(10, "Maksimal 10 opsi"),
    correctIndex: z
      .number()
      .int()
      .min(0, "Silakan pilih jawaban yang benar"),
  })
  .refine((v) => v.correctIndex < v.options.length, {
    message: "Jawaban benar harus salah satu dari opsi",
    path: ["correctIndex"],
  });

export type QuizQuestionFormValues = z.infer<typeof quizQuestionFormSchema>;
