import {
  BookOpen,
  Map,
  Church,
  Users,
  Sparkles,
  Scroll,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import type { JSONContent } from '@tiptap/react';
import type { LoreNoteCategory } from '@/types/lore-notes';

/**
 * Map lore note categories to Lucide icons
 */
export const LORE_NOTE_CATEGORY_ICONS: Record<LoreNoteCategory, LucideIcon> = {
  History: BookOpen,
  Geography: Map,
  Religion: Church,
  Culture: Users,
  Magic: Sparkles,
  Legends: Scroll,
  Other: FileText,
};

/**
 * Map lore note categories to colors (for badges and icons)
 */
export const LORE_NOTE_CATEGORY_COLORS: Record<LoreNoteCategory, string> = {
  History: 'text-amber-600 bg-amber-50 border-amber-200',
  Geography: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  Religion: 'text-purple-600 bg-purple-50 border-purple-200',
  Culture: 'text-blue-600 bg-blue-50 border-blue-200',
  Magic: 'text-violet-600 bg-violet-50 border-violet-200',
  Legends: 'text-orange-600 bg-orange-50 border-orange-200',
  Other: 'text-gray-600 bg-gray-50 border-gray-200',
};

/**
 * Get icon component for a category
 */
export function getCategoryIcon(category: LoreNoteCategory): LucideIcon {
  return LORE_NOTE_CATEGORY_ICONS[category];
}

/**
 * Get color classes for a category
 */
export function getCategoryColor(category: LoreNoteCategory): string {
  return LORE_NOTE_CATEGORY_COLORS[category];
}

/**
 * Extract plain text excerpt from Tiptap JSONContent
 * Returns first N characters for preview
 */
export function extractExcerpt(contentJson: JSONContent | null, maxLength: number = 100): string {
  if (!contentJson || !contentJson.content) return '';

  let text = '';

  function extractText(node: JSONContent): void {
    if (node.type === 'text') {
      text += node.text || '';
    } else if (node.type === 'hardBreak') {
      text += ' ';
    } else if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        extractText(child);
        if (text.length >= maxLength) break;
      }
    }
  }

  extractText(contentJson);

  if (text.length > maxLength) {
    return text.substring(0, maxLength).trim() + '...';
  }

  return text.trim();
}
