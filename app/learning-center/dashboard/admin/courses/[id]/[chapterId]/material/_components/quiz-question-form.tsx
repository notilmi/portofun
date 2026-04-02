"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  quizQuestionFormSchema,
  type QuizQuestionFormValues,
} from "./quiz-question-form-schema";
import {
  optionKeyFromIndex,
  serializeQuizAnswer,
  type QuizOption,
} from "./quiz-question-utils";

export type QuizQuestionInput = {
  question: string;
  answer: string;
  correctAnswer: string;
};

function firstErrorMessage(errors: unknown[]): string | undefined {
  for (const error of errors) {
    if (typeof error === "string" && error.length > 0) {
      return error;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      return (error as { message: string }).message;
    }
  }

  return undefined;
}

type QuizQuestionFormProps = {
  initialValues?: QuizQuestionFormValues;
  onSubmit: (value: QuizQuestionInput) => Promise<boolean> | boolean;
  onCancel: () => void;
  submitLabel?: string;
};

export default function QuizQuestionForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Question",
}: QuizQuestionFormProps) {
  const [feedback, setFeedback] = useState<string | undefined>();

  const form = useForm({
    defaultValues: {
      question: initialValues?.question ?? "",
      options:
        initialValues?.options ??
        ([{ text: "" }, { text: "" }] as QuizQuestionFormValues["options"]),
      correctIndex: initialValues?.correctIndex ?? 0,
    },
    onSubmit: async ({ value }) => {
      setFeedback(undefined);

      const parsed = quizQuestionFormSchema.safeParse(value);
      if (!parsed.success) {
        setFeedback(parsed.error.issues[0]?.message ?? "Validation failed");
        return;
      }

      const optionsWithKeys: QuizOption[] = parsed.data.options.map((o, idx) => ({
        key: optionKeyFromIndex(idx),
        text: o.text,
      }));

      const answer = serializeQuizAnswer(optionsWithKeys);
      const correctAnswer = optionKeyFromIndex(parsed.data.correctIndex);

      const ok = await onSubmit({
        question: parsed.data.question,
        answer,
        correctAnswer,
      });

      if (!ok) {
        setFeedback("Failed to save question. Please try again.");
      }
    },
  });

  const optionsCount = useMemo(
    () => form.state.values.options.length,
    [form.state.values.options.length],
  );

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="question"
          validators={{
            onChange: ({ value }) => {
              const result = quizQuestionFormSchema.shape.question.safeParse(value);
              if (!result.success) return result.error.issues[0]?.message;
              return undefined;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Question</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="What is TypeScript?"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoFocus
                />
                <FieldDescription>
                  Keep it short and unambiguous. (Rich text can be added later.)
                </FieldDescription>
                <FieldError>
                  {firstErrorMessage(field.state.meta.errors as unknown[])}
                </FieldError>
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field name="options">
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
              <FieldContent>
                <FieldLabel>Options</FieldLabel>
                <div className="space-y-2">
                  {field.state.value.map((opt, idx) => {
                    const key = optionKeyFromIndex(idx);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="correct"
                            checked={form.state.values.correctIndex === idx}
                            onChange={() => form.setFieldValue("correctIndex", idx)}
                          />
                          <span className="w-5 text-muted-foreground">{key}.</span>
                        </label>
                        <Input
                          value={opt.text}
                          placeholder={`Option ${key}`}
                          onChange={(e) => {
                            const next = [...field.state.value];
                            next[idx] = { text: e.target.value };
                            field.handleChange(next);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={field.state.value.length <= 2}
                          onClick={() => {
                            if (field.state.value.length <= 2) return;
                            const next = field.state.value.filter((_, i) => i !== idx);
                            field.handleChange(next);

                            // keep correctIndex in bounds
                            const currentCorrect = form.state.values.correctIndex;
                            const nextCorrect =
                              currentCorrect === idx
                                ? 0
                                : currentCorrect > idx
                                  ? currentCorrect - 1
                                  : currentCorrect;
                            form.setFieldValue("correctIndex", nextCorrect);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={optionsCount >= 10}
                    onClick={() => {
                      if (optionsCount >= 10) return;
                      field.handleChange([...field.state.value, { text: "" }]);
                    }}
                  >
                    Add option
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Select the radio button to mark the correct answer.
                  </p>
                </div>

                <FieldError>
                  {firstErrorMessage(field.state.meta.errors as unknown[])}
                </FieldError>
              </FieldContent>
            </Field>
          )}
        </form.Field>

        {feedback && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {feedback}
          </div>
        )}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
