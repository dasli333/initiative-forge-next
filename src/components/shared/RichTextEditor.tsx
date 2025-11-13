'use client';

import { useEditor, EditorContent, type JSONContent, ReactNodeViewRenderer, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { createMentionExtension } from './mentions/MentionExtension';
import { MentionNode } from './mentions/MentionNode';
import { searchCampaignEntities } from '@/lib/api/entities';
import { LinkPopover } from './LinkPopover';

interface RichTextEditorProps {
  value: JSONContent | null;
  onChange: (value: JSONContent) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  readonly?: boolean;
  campaignId?: string; // For @mentions
}

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = 'Write something...',
  className,
  readonly = false,
  campaignId,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !readonly,
    extensions: [
      StarterKit.configure({
        link: {
           openOnClick: false,
           autolink: false
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      // @mentions extension (only if campaignId provided)
      ...(campaignId
        ? [
            createMentionExtension({
              campaignId,
              onSearch: async (query) => {
                return await searchCampaignEntities(campaignId, query);
              },
            }).extend({
              addAttributes() {
                return {
                  id: {
                    default: null,
                    parseHTML: (element) => element.getAttribute('data-id'),
                    renderHTML: (attributes) => {
                      if (!attributes.id) return {};
                      return { 'data-id': attributes.id };
                    },
                  },
                  label: {
                    default: null,
                    parseHTML: (element) => element.getAttribute('data-label'),
                    renderHTML: (attributes) => {
                      if (!attributes.label) return {};
                      return { 'data-label': attributes.label };
                    },
                  },
                  entityType: {
                    default: null,
                    parseHTML: (element) => element.getAttribute('data-type'),
                    renderHTML: (attributes) => {
                      if (!attributes.entityType) return {};
                      return { 'data-type': attributes.entityType };
                    },
                  },
                };
              },
              addNodeView() {
                return ReactNodeViewRenderer(MentionNode);
              },
              addStorage() {
                return {
                  campaignId, // Store campaignId in extension storage
                };
              },
            }),
          ]
        : []),
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

  // Subscribe to editor state changes for toolbar button states
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return null;
      return {
        isBold: ctx.editor.isActive('bold'),
        isItalic: ctx.editor.isActive('italic'),
        isHeading2: ctx.editor.isActive('heading', { level: 2 }),
        isHeading3: ctx.editor.isActive('heading', { level: 3 }),
        isBulletList: ctx.editor.isActive('bulletList'),
        isOrderedList: ctx.editor.isActive('orderedList'),
      };
    },
  });

  // State for link and image dialogs
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  // Update editor editable state when readonly prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readonly);
    }
  }, [editor, readonly]);

  // Sync editor content when value prop changes
  useEffect(() => {
    if (editor) {
      const currentContent = editor.getJSON();
      const newValue = value || undefined;
      // Only update if content actually changed (avoid cursor jump)
      if (JSON.stringify(currentContent) !== JSON.stringify(newValue)) {
        // Use queueMicrotask to avoid flushSync warning during render
        queueMicrotask(() => {
          editor.commands.setContent(newValue);
        });
      }
    }
  }, [editor, value]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const hasText = from !== to;
    setHasSelection(hasText);
    setLinkPopoverOpen(true);
  }, [editor]);

  // Keyboard shortcut for Ctrl+K / Cmd+K to open link popover
  useEffect(() => {
    if (!editor || readonly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const { from, to } = editor.state.selection;
        const hasText = from !== to;
        setHasSelection(hasText);
        setLinkPopoverOpen(true);
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('keydown', handleKeyDown);

    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, readonly]);

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
          className={editorState?.isBold ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editorState?.isItalic ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editorState?.isHeading2 ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editorState?.isHeading3 ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editorState?.isBulletList ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorState?.isOrderedList ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={addLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        </div>
      )}

      {/* Editor */}
      <EditorContent
        editor={editor}
        className={readonly ? '' : 'bg-white dark:bg-gray-950'}
        placeholder={placeholder}
      />

      {/* Link Dialog */}
      {!readonly && (
        <>
          <LinkPopover
            editor={editor}
            open={linkPopoverOpen}
            onOpenChange={setLinkPopoverOpen}
            hasSelection={hasSelection}
          />
        </>
      )}
    </div>
  );
}
