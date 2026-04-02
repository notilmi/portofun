"use client";
import "./richtext.editor.style.scss";

import { TextStyleKit } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "./richtext.menu-bar";
import { EditorContextMenu } from "./richtext.context-menu";
import { Editor, HTMLContent } from "@tiptap/core";
import { cn } from "@/lib/utils";

// Define the extensions to be used in the editor
const extensions = [
  TextStyleKit,
  StarterKit,
  Placeholder.configure({
    placeholder: "Write something …",
  }),
];

/// Define editor styles
const editorClassName = [
  // Main editor styles
  "tiptap rounded-md bg-background text-sm leading-6 outline-none",
  // Typography styles for <p>
  "[&_p]:my-2",
  // Typography styles for <ul>
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
  // Typography styles for <ol>
  "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
  // Typography styles for various elements
  "[&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight",
  // Typography styles for <h2>
  "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight",
  // Typography styles for <h3>
  "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight",
  // Typography styles for <code>, <pre>, <blockquote>, and <hr>
  "[&_code]:rounded [&_code]:bg-foreground/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-foreground/15 [&_pre]:bg-foreground/5 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-foreground/20 [&_blockquote]:pl-4 [&_blockquote]:italic",
  "[&_hr]:my-6 [&_hr]:border-foreground/15",
].join(" ");

interface IEditorProps {
  // HTML Content is typealias for string
  onBlur?: (content: HTMLContent) => void;
  onUpdate?: (content: HTMLContent) => void;
  className?: string;
  hideMenuBar?: boolean;
  value?: HTMLContent;
  error?: string;
  readOnly?: boolean;
}

export default function RichTextEditor({
  onBlur,
  onUpdate,
  className,
  hideMenuBar,
  value,
  error,
  readOnly,
}: IEditorProps) {
  function handleBlur(editor: Editor) {
    onBlur?.(editor.getHTML());
  }

  function handleUpdate(editor: Editor) {
    onUpdate?.(editor.getHTML());
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: editorClassName,
      },
    },
    onBlur: ({ editor }) => handleBlur(editor),
    onUpdate: ({ editor }) => handleUpdate(editor),
    content: value,
  });

  return editor ? (
    <div className={cn("flex w-full flex-col gap-4 rounded-lg", className)}>
      <MenuBar editor={editor} className={cn(hideMenuBar && "hidden")} />
      {readOnly ? (
        <EditorContent editor={editor} />
      ) : (
        <EditorContextMenu editor={editor}>
          <EditorContent editor={editor} />
        </EditorContextMenu>
      )}
      {error && <p className="text-destructive">{error}</p>}
    </div>
  ) : null;
}
