export type MaterialTypeKey = "markdown" | "youtube" | "video" | "quiz";

const MATERIAL_TYPE_LABEL: Record<MaterialTypeKey, string> = {
  markdown: "Document",
  youtube: "Video",
  video: "Video",
  quiz: "Quiz",
};

export function materialTypeLabel(type: string): string {
  const key = type.trim().toLowerCase() as MaterialTypeKey;
  return MATERIAL_TYPE_LABEL[key] ?? type;
}
