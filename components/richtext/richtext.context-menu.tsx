"use client";

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import * as React from "react";
import {
  Bold,
  Code,
  Eraser,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { menuBarStateSelector } from "./richtext.util";

type EditorContextMenuProps = {
  editor: Editor;
  children: React.ReactNode;
};

export function EditorContextMenu({
  editor,
  children,
}: EditorContextMenuProps) {
  const [_, setOpen] = React.useState(false);

  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector,
  });

  // Classname Generator for icon buttons
  const iconButtonClassName = (active?: boolean) =>
    cn(
      "rounded-md",
      "text-foreground/80",
      "hover:bg-foreground/5 hover:text-foreground",
      "focus-visible:border-foreground/30 focus-visible:ring-foreground/30",
      active && "bg-foreground/10 text-foreground",
    );

  // Helper function to run editor commands and close the menu
  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <ContextMenu onOpenChange={setOpen} modal={false}>
      <ContextMenuTrigger asChild>
        <div className="rounded-md">{children}</div>
      </ContextMenuTrigger>

      <ContextMenuContent
        className={cn(
          "min-w-0 w-auto rounded-lg border border-foreground/15 bg-background/95 p-1.5 text-foreground shadow-lg backdrop-blur",
        )}
      >
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Bold"
            title="Bold"
            disabled={!editorState.canBold}
            className={iconButtonClassName(editorState.isBold)}
            onClick={() => run(() => editor.chain().focus().toggleBold().run())}
          >
            <Bold />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Italic"
            title="Italic"
            disabled={!editorState.canItalic}
            className={iconButtonClassName(editorState.isItalic)}
            onClick={() =>
              run(() => editor.chain().focus().toggleItalic().run())
            }
          >
            <Italic />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Strikethrough"
            title="Strikethrough"
            disabled={!editorState.canStrike}
            className={iconButtonClassName(editorState.isStrike)}
            onClick={() =>
              run(() => editor.chain().focus().toggleStrike().run())
            }
          >
            <Strikethrough />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Inline code"
            title="Inline code"
            disabled={!editorState.canCode}
            className={iconButtonClassName(editorState.isCode)}
            onClick={() => run(() => editor.chain().focus().toggleCode().run())}
          >
            <Code />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Clear marks"
            title="Clear marks"
            disabled={!editorState.canClearMarks}
            className={iconButtonClassName(false)}
            onClick={() =>
              run(() => editor.chain().focus().unsetAllMarks().run())
            }
          >
            <Eraser />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Bullet list"
            title="Bullet list"
            disabled={!editorState.canBulletList}
            className={iconButtonClassName(editorState.isBulletList)}
            onClick={() =>
              run(() => editor.chain().focus().toggleBulletList().run())
            }
          >
            <List />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Ordered list"
            title="Ordered list"
            disabled={!editorState.canOrderedList}
            className={iconButtonClassName(editorState.isOrderedList)}
            onClick={() =>
              run(() => editor.chain().focus().toggleOrderedList().run())
            }
          >
            <ListOrdered />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Blockquote"
            title="Blockquote"
            disabled={!editorState.canBlockquote}
            className={iconButtonClassName(editorState.isBlockquote)}
            onClick={() =>
              run(() => editor.chain().focus().toggleBlockquote().run())
            }
          >
            <Quote />
          </Button>
        </div>

        <ContextMenuSeparator className="my-1.5 bg-foreground/10" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Undo"
            title="Undo"
            disabled={!editorState.canUndo}
            className={iconButtonClassName(false)}
            onClick={() => run(() => editor.chain().focus().undo().run())}
          >
            <Undo2 />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Redo"
            title="Redo"
            disabled={!editorState.canRedo}
            className={iconButtonClassName(false)}
            onClick={() => run(() => editor.chain().focus().redo().run())}
          >
            <Redo2 />
          </Button>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}
