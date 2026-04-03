"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  editChapterFormSchema,
  type EditChapterFormValues,
} from "./edit-chapter-form-schema";

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

type EditChapterFormProps = {
  initialValues: {
    title: string;
  };
  onSubmit: (values: EditChapterFormValues) => Promise<boolean>;
  onCancel: () => void;
};

export default function EditChapterForm({
  initialValues,
  onSubmit,
  onCancel,
}: EditChapterFormProps) {
  const [feedback, setFeedback] = useState<string | undefined>(undefined);

  const form = useForm({
    defaultValues: {
      title: initialValues.title,
    },
    onSubmit: async ({ value }) => {
      setFeedback(undefined);

      // Validate with Zod schema
      const parsed = editChapterFormSchema.safeParse(value);
      if (!parsed.success) {
        setFeedback(parsed.error.issues[0]?.message ?? "Validasi gagal");
        return;
      }

      const isSuccess = await onSubmit(parsed.data);
      if (!isSuccess) {
        setFeedback("Gagal memperbarui bab. Silakan coba lagi.");
      }
    },
  });

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
        {/* Title Field */}
        <form.Field
          name="title"
          validators={{
            onChange: ({ value }) => {
              const result = editChapterFormSchema.shape.title.safeParse(value);
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
                <FieldLabel htmlFor={field.name}>Judul Bab</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Pengantar TypeScript"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  autoFocus
                />
                <FieldError>
                  {firstErrorMessage(field.state.meta.errors as unknown[])}
                </FieldError>
              </FieldContent>
            </Field>
          )}
        </form.Field>

        {/* Feedback Message */}
        {feedback && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {feedback}
          </div>
        )}

        {/* Action Buttons */}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                Batal
                </Button>
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
