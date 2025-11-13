'use client';

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Trash2 } from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { normalizeUrl } from '@/lib/utils/urlValidation';

interface LinkPopoverProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasSelection: boolean;
}

export function LinkPopover({ editor, open, onOpenChange, hasSelection }: LinkPopoverProps) {
  const previousUrl = editor.getAttributes('link').href || '';
  const [url, setUrl] = useState(previousUrl);
  const [linkText, setLinkText] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);

  // Update URL when popover opens
  useEffect(() => {
    if (open) {
      const currentUrl = editor.getAttributes('link').href || '';
      setUrl(currentUrl);
      setLinkText('');
      setOpenInNewTab(editor.getAttributes('link').target === '_blank');
    }
  }, [open, editor]);

  const handleSetLink = () => {
    if (!url) {
      // If URL is empty and we're in an existing link, remove it
      if (previousUrl) {
        editor.chain().focus().unsetLink().run();
      }
      onOpenChange(false);
      return;
    }

    const validUrl = normalizeUrl(url);

    // Scenario 3: No selection and no existing link - insert new link with text
    if (!hasSelection && !previousUrl) {
      if (!linkText) return; // Need text to insert

      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: linkText,
          marks: [
            {
              type: 'link',
              attrs: {
                href: validUrl,
                target: openInNewTab ? '_blank' : null,
              },
            },
          ],
        })
        .run();
    }
    // Scenario 2: Editing existing link
    else if (previousUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: validUrl, target: openInNewTab ? '_blank' : null })
        .run();
    }
    // Scenario 1: Has selection - apply link to selected text
    else {
      editor
        .chain()
        .focus()
        .setLink({ href: validUrl, target: openInNewTab ? '_blank' : null })
        .run();
    }

    onOpenChange(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !url && !previousUrl) {
      // Closed without URL on new link - ensure no link mark active
      editor.chain().focus().unsetLink().run();
    }
    onOpenChange(newOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <span />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          {/* Show text field only when no selection and no existing link */}
          {!hasSelection && !previousUrl && (
            <div className="space-y-2">
              <Label htmlFor="link-text">Tekst do wyświetlenia</Label>
              <Input
                id="link-text"
                placeholder="np. Kliknij tutaj"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSetLink();
                }
              }}
              autoFocus={hasSelection || previousUrl}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="new-tab"
              checked={openInNewTab}
              onCheckedChange={(checked) => setOpenInNewTab(checked === true)}
            />
            <Label htmlFor="new-tab" className="text-sm font-normal cursor-pointer">
              Open in new tab
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSetLink}
              size="sm"
              className="flex-1"
              disabled={!hasSelection && !previousUrl && (!url || !linkText)}
            >
              <Check className="h-4 w-4 mr-1" />
              {previousUrl ? 'Update' : 'Insert'} Link
            </Button>
            {previousUrl && (
              <Button onClick={handleRemoveLink} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
