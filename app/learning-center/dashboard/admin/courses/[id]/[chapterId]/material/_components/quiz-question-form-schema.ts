import { z } from "zod";

export const quizOptionSchema = z.object({
  text: z.string().trim().min(1, "Option text is required"),
});

export const quizQuestionFormSchema = z
  .object({
    question: z.string().trim().min(1, "Question is required"),
    options: z
      .array(quizOptionSchema)
      .min(2, "At least 2 options are required")
      .max(10, "Maximum 10 options"),
    correctIndex: z
      .number()
      .int()
      .min(0, "Please select the correct answer"),
  })
  .refine((v) => v.correctIndex < v.options.length, {
    message: "Correct answer must be one of the options",
    path: ["correctIndex"],
  });

export type QuizQuestionFormValues = z.infer<typeof quizQuestionFormSchema>;
