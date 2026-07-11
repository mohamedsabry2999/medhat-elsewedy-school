import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Link2, Heading2, Heading3, Quote, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder || "اكتب هنا..." }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[160px] px-3 py-2 focus:outline-none",
        dir: "rtl",
      },
    },
  });

  // Sync external value changes (e.g. reset)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  const Btn = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant={active ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className="border rounded-md bg-white">
      <div className="flex flex-wrap gap-1 border-b p-1">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="عريض">
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="مائل">
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="عنوان H2"
        >
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="عنوان H3"
        >
          <Heading3 className="h-4 w-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="قائمة نقطية"
        >
          <List className="h-4 w-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="قائمة مرقمة"
        >
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="اقتباس"
        >
          <Quote className="h-4 w-4" />
        </Btn>
        <Btn
          onClick={() => {
            const url = window.prompt("رابط:", editor.getAttributes("link").href || "https://");
            if (url === null) return;
            if (url === "") editor.chain().focus().unsetLink().run();
            else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
          title="رابط"
        >
          <Link2 className="h-4 w-4" />
        </Btn>
        <span className="mx-1 w-px bg-border" />
        <Btn onClick={() => editor.chain().focus().undo().run()} title="تراجع">
          <Undo2 className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="إعادة">
          <Redo2 className="h-4 w-4" />
        </Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
