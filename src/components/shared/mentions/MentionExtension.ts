import { Mention } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import { SuggestionOptions } from '@tiptap/suggestion';
import type { EntitySearchResult } from '@/lib/api/entities';
import { MentionList } from './MentionList';

export interface MentionExtensionOptions {
  campaignId: string;
  onSearch: (query: string) => Promise<EntitySearchResult[]>;
}

/**
 * Configure Tiptap Mention extension for @mentions
 */
export function createMentionExtension(options: MentionExtensionOptions) {
  return Mention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
    suggestion: {
      char: '@',
      items: async ({ query }) => {
        return await options.onSearch(query);
      },
      render: () => {
        let component: ReactRenderer<any>;
        let popup: HTMLDivElement | null = null;

        return {
          onStart: (props) => {
            component = new ReactRenderer(MentionList, {
              props: {
                ...props,
                campaignId: options.campaignId,
              },
              editor: props.editor,
            });

            if (!props.clientRect) {
              return;
            }

            // Create popup element
            popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.zIndex = '9999';
            popup.appendChild(component.element);
            document.body.appendChild(popup);

            // Position popup
            const rect = props.clientRect();
            if (rect) {
              popup.style.top = `${rect.bottom + 8}px`;
              popup.style.left = `${rect.left}px`;
            }
          },

          onUpdate(props) {
            component.updateProps({
              ...props,
              campaignId: options.campaignId,
            });

            if (!props.clientRect || !popup) {
              return;
            }

            // Update popup position
            const rect = props.clientRect();
            if (rect) {
              popup.style.top = `${rect.bottom + 8}px`;
              popup.style.left = `${rect.left}px`;
            }
          },

          onKeyDown(props) {
            if (props.event.key === 'Escape') {
              return true;
            }

            return (component.ref as any)?.onKeyDown?.(props);
          },

          onExit() {
            if (popup) {
              popup.remove();
              popup = null;
            }
            component.destroy();
          },
        };
      },
    } as Partial<SuggestionOptions>,
  });
}
