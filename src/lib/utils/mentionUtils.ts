import type { JSONContent } from '@tiptap/react';

export interface ExtractedMention {
  id: string;
  entityType: string;
}

/**
 * Extract all @mention nodes from Tiptap JSON content
 * @param json - Tiptap JSON content
 * @returns Array of extracted mentions with id and entityType
 */
export function extractMentionsFromJson(
  json: JSONContent | null | undefined
): ExtractedMention[] {
  if (!json || typeof json !== 'object') {
    return [];
  }

  const mentions: ExtractedMention[] = [];

  const traverse = (node: JSONContent): void => {
    // Check if this node is a mention
    if (node.type === 'mention' && node.attrs) {
      const { id, entityType } = node.attrs;
      if (id && entityType) {
        mentions.push({ id, entityType });
      }
    }

    // Recursively traverse child nodes
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };

  traverse(json);

  return mentions;
}

/**
 * Format field name for display
 * Removes _json suffix, replaces underscores with spaces, capitalizes first letter
 * @param field - Raw field name (e.g., "description_json", "start_date")
 * @returns Formatted field name (e.g., "Description", "Start date")
 */
export function formatFieldName(field: string): string {
  return field
    .replace(/_json$/, '') // Remove _json suffix
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter
}
