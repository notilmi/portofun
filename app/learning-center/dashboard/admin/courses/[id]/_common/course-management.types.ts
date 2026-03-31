export type CourseDetail = {
  id: string;
  title: string;
  description: string;
  isArchived: boolean;
};

export type ChapterItem = {
  id: string;
  title: string;
  sequenceOrder: number;
};

export type ActionError = {
  code: string;
  error: string;
};

export function isActionError(value: unknown): value is ActionError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "error" in value
  );
}
