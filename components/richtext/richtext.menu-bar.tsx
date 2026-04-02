import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { menuBarStateSelector } from "./richtext.util";
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

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const MenuBar = ({
  editor,
  className,
}: {
  editor: Editor;
  className?: string;
}) => {
  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector,
  });

  if (!editor) {
    return null;
  }

  const iconButtonClassName = (active?: boolean) =>
    cn(
      "rounded-md",
      "text-foreground/80",
      "hover:bg-foreground/5 hover:text-foreground",
      "focus-visible:border-foreground/30 focus-visible:ring-foreground/30",
      active && "bg-foreground/10 text-foreground",
    );

  const headingValue =
    (editorState.isHeading1 && "h1") ||
    (editorState.isHeading2 && "h2") ||
    (editorState.isHeading3 && "h3") ||
    (editorState.isHeading4 && "h4") ||
    (editorState.isHeading5 && "h5") ||
    (editorState.isHeading6 && "h6") ||
    "";

  const headingLevelByValue = {
    h1: 1,
    h2: 2,
    h3: 3,
    h4: 4,
    h5: 5,
    h6: 6,
  } as const;

  return (
    <div
      className={cn(
        "rounded-md border border-foreground/15 bg-background p-2",
        className,
      )}
    >
      <div className="flex items-center gap-1 overflow-x-auto">
        <Select
          value={headingValue}
          onValueChange={(value) => {
            if (!value || value === headingValue) return;
            const level =
              headingLevelByValue[value as keyof typeof headingLevelByValue];
            if (!level) return;
            editor.chain().focus().setHeading({ level }).run();
          }}
        >
          <SelectTrigger className="h-8 w-40 px-2">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
            <SelectItem value="h4">Heading 4</SelectItem>
            <SelectItem value="h5">Heading 5</SelectItem>
            <SelectItem value="h6">Heading 6</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Bold"
          title="Bold"
          disabled={!editorState.canBold}
          className={iconButtonClassName(editorState.isBold)}
          onClick={() => editor.chain().focus().toggleBold().run()}
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
          onClick={() => editor.chain().focus().toggleItalic().run()}
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
          onClick={() => editor.chain().focus().toggleStrike().run()}
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
          onClick={() => editor.chain().focus().toggleCode().run()}
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
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
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
          onClick={() => editor.chain().focus().toggleBulletList().run()}
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
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
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
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote />
        </Button>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Undo"
          title="Undo"
          disabled={!editorState.canUndo}
          className={iconButtonClassName(false)}
          onClick={() => editor.chain().focus().undo().run()}
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
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 />
        </Button>
      </div>
    </div>
  );
};
