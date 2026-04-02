"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon, PlusIcon, SaveIcon } from "lucide-react";
import { useState } from "react";

import RichTextEditor from "@/components/richtext/richtext.editor";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  materialFormSchema,
  type MaterialFormValues,
  type QuizQuestionInput,
} from "./material-form-schema";
import QuizPreviewDialog from "./quiz-preview-dialog";
import QuizQuestionsEditor from "./quiz-questions-editor";

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

type MaterialFormProps = {
  mode: "create" | "update";
  initialValues?: Partial<MaterialFormValues>;
  onSubmit: (values: MaterialFormValues) => Promise<boolean>;
  className?: string;
  formId?: string;
  hideSubmitButton?: boolean;
};

export default function MaterialForm({
  mode,
  initialValues,
  onSubmit,
  className,
  formId = "material-form",
  hideSubmitButton = false,
}: MaterialFormProps) {
  const [feedback, setFeedback] = useState<string | undefined>(undefined);

  const form = useForm({
    defaultValues: {
      title: initialValues?.title ?? "",
      type:
        initialValues?.type ?? ("markdown" as "markdown" | "video" | "quiz"),
      content: initialValues?.content ?? "",
      videoUrl: initialValues?.videoUrl ?? "",
      quizQuestions:
        (initialValues?.quizQuestions as QuizQuestionInput[] | undefined) ??
        ([] as QuizQuestionInput[]),
    },
    onSubmit: async ({ value }) => {
      setFeedback(undefined);

      // Validate with Zod schema
      const parsed = materialFormSchema.safeParse(value);
      if (!parsed.success) {
        setFeedback(parsed.error.issues[0]?.message ?? "Validation failed");
        return;
      }

      const isSuccess = await onSubmit(parsed.data);
      if (isSuccess) {
        if (mode === "create") {
          form.reset();
        }
      } else {
        setFeedback("Failed to save material. Please try again.");
      }
    },
  });

  return (
    <form
      id={formId}
      className={cn("space-y-4", className)}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        {/* Title Field */}
        <form.Field
          name="title"
          validators={{
            onChange: ({ value }) => {
              const result = materialFormSchema.shape.title.safeParse(value);
              if (!result.success) {
                return result.error.issues[0]?.message;
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Material Title</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Introduction to Variables"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldDescription>
                  A clear, descriptive title for this learning material.
                </FieldDescription>
                <FieldError>
                  {firstErrorMessage(field.state.meta.errors as unknown[])}
                </FieldError>
              </FieldContent>
            </Field>
          )}
        </form.Field>

        {/* Material Type Field */}
        <form.Field
          name="type"
          validators={{
            onChange: ({ value }) => {
              const result = materialFormSchema.shape.type.safeParse(value);
              if (!result.success) {
                return result.error.issues[0]?.message;
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0 || undefined}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Material Type</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as "markdown" | "video" | "quiz")
                  }
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={field.state.meta.errors.length > 0 || undefined}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select material type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown Content</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Choose the type of learning material you want to create.
                </FieldDescription>
                <FieldError>
                  {firstErrorMessage(field.state.meta.errors as unknown[])}
                </FieldError>
              </FieldContent>
            </Field>
          )}
        </form.Field>

        {/* Conditional Fields Based on Type */}
        <form.Subscribe selector={(state) => state.values.type}>
          {(type) => (
            <>
              {/* Markdown Content Field */}
              {type === "markdown" && (
                <form.Field
                  name="content"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value || value.trim().length === 0) {
                        return "Content is required for markdown materials";
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <Field
                      data-invalid={field.state.meta.errors.length > 0 || undefined}
                    >
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Content</FieldLabel>
                        <RichTextEditor
                          value={field.state.value ?? undefined}
                          onUpdate={(value) => field.handleChange(value)}
                          error={firstErrorMessage(
                            field.state.meta.errors as unknown[],
                          )}
                        />

                      </FieldContent>
                    </Field>
                  )}
                </form.Field>
              )}

              {/* Quiz Questions Field */}
              {type === "quiz" && (
                <form.Field
                  name="quizQuestions"
                  validators={{
                    onChange: ({ value }) => {
                      if (!Array.isArray(value) || value.length === 0) {
                        return "At least 1 quiz question is required";
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <Field
                      data-invalid={field.state.meta.errors.length > 0 || undefined}
                    >
                      <FieldContent>
                        <div className="flex items-center justify-between gap-3">
                          <FieldLabel>Questions</FieldLabel>
                          <QuizPreviewDialog questions={field.state.value ?? []} />
                        </div>
                        <QuizQuestionsEditor
                          value={field.state.value ?? []}
                          onChange={(next) => field.handleChange(next)}
                          error={firstErrorMessage(
                            field.state.meta.errors as unknown[],
                          )}
                        />
                        <FieldError>
                          {firstErrorMessage(
                            field.state.meta.errors as unknown[],
                          )}
                        </FieldError>
                      </FieldContent>
                    </Field>
                  )}
                </form.Field>
              )}

              {/* Video URL Field */}
              {type === "video" && (
                <form.Field
                  name="videoUrl"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value || value.trim().length === 0) {
                        return "Video URL is required for video materials";
                      }
                      try {
                        new URL(value);
                        return undefined;
                      } catch {
                        return "Please enter a valid URL";
                      }
                    },
                  }}
                >
                  {(field) => (
                    <Field
                      data-invalid={field.state.meta.errors.length > 0 || undefined}
                    >
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Video URL</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <FieldDescription>
                          Enter the URL of the video (YouTube, Vimeo, etc.).
                        </FieldDescription>
                        <FieldError>
                          {firstErrorMessage(field.state.meta.errors as unknown[])}
                        </FieldError>
                      </FieldContent>
                    </Field>
                  )}
                </form.Field>
              )}
            </>
          )}
        </form.Subscribe>

        {/* Feedback Message */}
        {feedback && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {feedback}
          </div>
        )}

        {/* Submit Button */}
        {!hideSubmitButton && (
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-fit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    {mode === "create" ? <PlusIcon /> : <SaveIcon />}
                    {mode === "create" ? "Create Material" : "Save Changes"}
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        )}
      </FieldGroup>
    </form>
  );
}
