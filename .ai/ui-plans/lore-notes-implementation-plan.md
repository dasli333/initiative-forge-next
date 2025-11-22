# Plan Implementacji: Lore Notes (SplitLayout 30/70)

## 1. Database

**Table: `lore_notes`**
- `id`, `campaign_id`, `title`, `content_json` (JSONB)
- `category` (enum: Historia, Geografia, Religia, Kultura, Magia, Legendy, Inne - fixed)
- `tags` (text[])
- `created_at`, `updated_at`, `user_id`
- Indexes: campaign_id, category, tags (GIN)
- RLS: user owns campaign

## 2. Types & Schemas

- `LoreNote` (raw), `LoreNoteDTO` (typed content_json)
- `LoreNoteCategory` enum
- `CreateLoreNoteRequest`, `UpdateLoreNoteRequest`
- Zod schemas w `src/lib/schemas/loreNote.ts`

## 3. API Layer (`src/lib/api/lore-notes.ts`)

- `getLoreNotes(campaignId, filters?)` - category/tags filtering
- `getLoreNoteById(id)`
- `createLoreNote(data)` + sync entity mentions
- `updateLoreNote(id, data)` + sync mentions
- `deleteLoreNote(id)`
- `searchLoreNotes(campaignId, query)` - fuzzy search (fuse.js)

## 4. React Query Hooks

- `useLoreNotesQuery(campaignId, filters)`
- `useLoreNoteQuery(id)`
- `useCreateLoreNoteMutation()` - optimistic updates
- `useUpdateLoreNoteMutation()` - optimistic updates
- `useDeleteLoreNoteMutation()`

## 5. Components (`src/components/lore-notes/`)

**LoreNotesLayout.tsx** - SplitLayout wrapper

**LEFT PANEL (30%):**
- **LoreNotesList.tsx:**
  - Search bar (title/content)
  - Sort dropdown (recent/title/category)
  - Filters: category select + tag multi-select
  - Scrollable list
  - Create button

- **LoreNoteListItem.tsx:**
  - Category icon (color-coded)
  - Title (truncate)
  - Excerpt (2 lines)
  - Tags (2 visible + "+N")

**RIGHT PANEL (70%):**
- **LoreNoteDetailPanel.tsx:**
  - Category badge + tags
  - RichTextEditor (readonly/edit modes)
  - Backlinks section
  - Edit/Delete actions

**SHARED:**
- **LoreNoteFiltersCompact.tsx** - filters UI
- **forms/LoreNoteFormDialog.tsx** - create/edit modal

## 6. Routing

- Route: `/campaigns/[id]/lore-notes`
- Nav: Add "Lore" to campaign sidebar

## 7. Feature Details

**Categories:**
- Fixed enum: Historia, Geografia, Religia, Kultura, Magia, Legendy, Inne
- Icon mapping: Book, Globe, Church, Users, Sparkles, Scroll, FileText
- Color-coding per category

**Tags:**
- Create on-the-fly
- Multi-select filter (OR logic)
- Autocomplete from existing campaign tags

**Rich Text:**
- Tiptap with @mentions
- Extract/sync entity mentions on save
- Backlinks from other entities

**Search & Filters:**
- Fuzzy search (title + content excerpt)
- Category: single-select + "All"
- Tags: multi-select + "Clear all"
- Combined: AND logic (category AND tags)

## 8. Implementation Order

1. DB migration + types + schemas
2. API functions + hooks
3. Basic CRUD components (list, detail, form)
4. Filters + search
5. Rich text + mentions integration
6. Backlinks
7. Testing (unit + e2e)

## 9. Layout Decision

**Wybrany layout: SplitLayout 30/70** ✅

**Uzasadnienie:**
- Spójność z NPCs, Quests, Factions, Story Arcs (wszystkie campaign entities używają tego patternu)
- Najlepszy do czytania długich treści rich text (70% szerokości)
- Najlepszy do przeglądania wielu notatek (szybkie skanowanie listy + pełna treść)
- Niski koszt implementacji (reużycie SplitLayout + istniejących komponentów filtrowania)
- Intuicyjny workflow: search → filter → select → read → edit

**Odrzucone opcje:**
- **Card Grid**: Niezgodne z campaign entities pattern, rich text w slideoverze zbyt ciasny
- **Masonry Grid**: Nie używany nigdzie w app, wysoka złożoność, gorsze UX do czytania
- **Table View**: Nie używany dla entities, słaby dla rich text preview
- **Simple List**: Gorszy workflow (full-page navigation vs panel switching)

## 10. Wymagania PRD (pełna zgodność)

- ✅ Tytuł, treść (rich text), kategoria, tagi
- ✅ Kategorie: Historia, Geografia, Religia, Kultura, Magia, Legendy, Inne (fixed enum)
- ✅ System tagów (tworzenie on-the-fly, multi-select filtering)
- ✅ Wyszukiwanie po tytule i treści (fuzzy search)
- ✅ Filtrowanie po kategorii i tagach
- ✅ Rich text z @mentions (Tiptap)
- ✅ Backlinks (mentions from/to other entities)

## 11. Decyzje Projektowe

- ❌ **Brak custom categories per campaign** - Fixed enum wystarczający, prostszy
- ❌ **Brak templates** - Nice-to-have, można dodać później jeśli users zgłoszą potrzebę
- ❌ **Brak export (PDF/markdown)** - Poza scope MVP
- ❌ **Brak pinnowania** - Poza scope MVP, można dodać później
