"use client";

import RichTextEditor from "@/components/richtext/richtext.editor";

export default function LessonContent({ content }: { content?: string | null }) {
  return <RichTextEditor value={content ?? ""} readOnly hideMenuBar />;
}
