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

export const createCourseFormSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(120, "Judul terlalu panjang"),
  description: z
    .string()
    .trim()
    .min(1, "Deskripsi wajib diisi")
    .max(500, "Deskripsi terlalu panjang"),
});

export type CreateCourseFormValues = z.infer<typeof createCourseFormSchema>;

type CreateCourseFormProps = {
  onSubmit: (values: CreateCourseFormValues) => Promise<boolean>;
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

export default function CreateCourseForm({
  onSubmit,
  className,
}: CreateCourseFormProps) {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = createCourseFormSchema.safeParse(value);
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
              const result = createCourseFormSchema.shape.title.safeParse(value);
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
                <FieldLabel htmlFor={field.name}>Judul</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Pengantar TypeScript"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldDescription>
                  Buat ini singkat dan jelas agar siswa cepat memahaminya.
                </FieldDescription>
                <FieldError>
                  {firstErrorMessage(field.state.meta.errors as unknown[])}
                </FieldError>
              </FieldContent>
            </Field>
          )}
        </form.Field>

        <form.Field
          name="description"
          validators={{
            onChange: ({ value }) => {
              const result = createCourseFormSchema.shape.description.safeParse(value);
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
                <FieldLabel htmlFor={field.name}>Deskripsi</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Kursus praktis yang berfokus pada proyek langsung"
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
                  Buat Kursus
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
