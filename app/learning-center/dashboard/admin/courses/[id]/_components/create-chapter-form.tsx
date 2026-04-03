"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { z } from "zod";

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
import { cn } from "@/lib/utils";

export const createChapterFormSchema = z.object({
  title: z.string().trim().min(1, "Judul bab wajib diisi").max(120, "Judul terlalu panjang"),
  sequenceOrder: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value || value.length === 0) {
        return undefined;
      }

      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return Number.NaN;
      }

      return parsed;
    })
    .refine((value) => value === undefined || Number.isFinite(value), {
      message: "Urutan harus berupa angka positif",
    }),
});

export type CreateChapterFormValues = z.infer<typeof createChapterFormSchema>;

type CreateChapterFormProps = {
  onSubmit: (values: CreateChapterFormValues) => Promise<boolean>;
  className?: string;
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

export default function CreateChapterForm({
  onSubmit,
  className,
}: CreateChapterFormProps) {
  const form = useForm({
    defaultValues: {
      title: "",
      sequenceOrder: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = createChapterFormSchema.safeParse(value);
      if (!parsed.success) {
        return;
      }

      const isSuccess = await onSubmit(parsed.data);
      if (isSuccess) {
        form.reset();
      }
    },
  });

  return (
    <form
      className={cn("space-y-4", className)}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="title"
          validators={{
            onChange: ({ value }) => {
              const result = createChapterFormSchema.shape.title.safeParse(value);
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
                  placeholder="Memulai"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldError>
                  {firstErrorMessage(field.state.meta.errors as unknown[])}
                </FieldError>
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field
          name="sequenceOrder"
          validators={{
            onChange: ({ value }) => {
              const result = createChapterFormSchema.shape.sequenceOrder.safeParse(value);
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
                <FieldLabel htmlFor={field.name}>Posisi (opsional)</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  inputMode="numeric"
                  placeholder="mis. 1"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldDescription>
                  Kosongkan untuk menambahkan bab di akhir.
                </FieldDescription>
                <FieldError>
                  {firstErrorMessage(field.state.meta.errors as unknown[])}
                </FieldError>
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting} className="w-fit">
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Membuat...
                </>
              ) : (
                <>
                  <PlusIcon />
                  Buat Bab
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
