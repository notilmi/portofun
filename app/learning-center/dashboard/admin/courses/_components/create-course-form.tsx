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
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
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
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Introduction to TypeScript"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldDescription>
                  Keep this short and clear so students can quickly understand it.
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
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="A practical course focused on hands-on projects"
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
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon />
                  Create Course
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
