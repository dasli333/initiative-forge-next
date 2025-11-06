'use client';

import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  LinkIcon,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallback, useEffect } from 'react';

interface RichTextEditorProps {
  value: JSONContent | null;
  onChange: (value: JSONContent) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  readonly?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = 'Write something...',
  className,
  readonly = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !readonly,
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: !readonly,
        HTMLAttributes: {
          class: 'text-emerald-600 dark:text-emerald-400 underline',
        },
      }),
    ],
    content: value || undefined,
    onUpdate: ({ editor }) => {
      if (!readonly) {
        onChange(editor.getJSON());
      }
    },
    onBlur: () => {
      if (!readonly) {
        onBlur?.();
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose dark:prose-invert max-w-none focus:outline-none',
          readonly ? 'p-0' : 'min-h-[200px] p-4',
          'prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
          'prose-p:text-gray-700 dark:prose-p:text-gray-300',
          'prose-a:text-emerald-600 dark:prose-a:text-emerald-400'
        ),
      },
    },
  });

  // Update editor editable state when readonly prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readonly);
    }
  }, [editor, readonly]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn(readonly ? '' : 'border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      {!readonly && (
        <div className="flex items-center gap-1 p-2 border-b bg-gray-50 dark:bg-gray-900">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={
            editor.isActive('heading', { level: 2 })
              ? 'bg-gray-200 dark:bg-gray-700'
              : ''
          }
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={
            editor.isActive('heading', { level: 3 })
              ? 'bg-gray-200 dark:bg-gray-700'
              : ''
          }
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={
            editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={
            editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={addLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        </div>
      )}

      {/* Editor */}
      <EditorContent
        editor={editor}
        className={readonly ? '' : 'bg-white dark:bg-gray-950'}
        placeholder={placeholder}
      />
    </div>
  );
}
