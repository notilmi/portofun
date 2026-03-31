// import type { JSONContent } from "@tiptap/core";
import { z, ZodError } from "zod";
import { ServiceError } from "@/domain/errors/ServiceError";

const ACCEPTABLE_BASE64_REGEX =
  /^data:(?<mime>[\w\/\-\+\.]+);base64,(?<data>[a-zA-Z0-9\/+\n=]+)$/;
const ACCEPTABLE_DATE_REGEX =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

export const dateschema = z.string().regex(ACCEPTABLE_DATE_REGEX, {
  error: "Invalid date format, expected YYYY-MM-DD",
});

export const base64schema = z.string().regex(ACCEPTABLE_BASE64_REGEX, {
  error: "Invalid base64 string format",
});

// export const richtextschema = z.any() as z.ZodType<JSONContent>;

export const idschema = z.string().min(36, "ID tidak valid");

export class ServerActionError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export class ValidationError extends ServerActionError {
  issues: ZodError["issues"];

  constructor(issues: ZodError["issues"]) {
    super("Validation Error", "VALIDATION_ERROR");
    this.issues = issues;
  }
}

export function validateInput<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): z.infer<T> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues);
  }

  return parsed.data;
}

export function handleServerActionError(
  error: unknown,
): ServerActionErrorResponse {
  if (error instanceof ValidationError) {
    console.log("Validation error:", error.issues);
    return {
      error: error.message,
      code: error.code,
    };
  }

  if (error instanceof ServerActionError) {
    console.log("Server action error:", error.message);
    return {
      error: error.message,
      code: error.code,
    };
  }

  if (error instanceof ServiceError) {
    console.log("Service error:", error.message);
    return {
      error: error.message,
      code: error.errorCode,
    };
  }

  console.error("Unhandled server action error:", error);

  return {
    error: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
  };
}

export type ServerActionErrorResponse = {
  error: string;
  code: string;
};

export type ServerActionValidationErrorResponse = ServerActionErrorResponse & {
  issues: ZodError["issues"];
};

export type ServerActionResponse<T> =
  | T
  | ServerActionErrorResponse
  | ServerActionValidationErrorResponse;
