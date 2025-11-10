# Story Arcs View - Szczegółowy Plan Implementacji (Split Layout 30/70)

## 1. Podsumowanie Decyzji Projektowych

### Architektura UI
- **Layout**: Split Layout 30/70 (jak Quests) - NIE accordion pattern
- **Left Panel (30%)**: Lista story arcs z filtrowaniem
- **Right Panel (70%)**: Detail panel z tabs (Details, Quests, Related)
- **Brak progress bar**: Story arcs są żywe, nie task tracker
- **Brak auto-expand**: User sam wybiera story arc do wyświetlenia
- **Brak obrazków**: Bez image_url w MVP

### Pattern Edycji
- **Inline editing** w detail panel (wzór: Quests)
- **Edit mode**: Border + background styling, toggle buttons (Edit/Delete ↔ Save/Cancel)
- **State management**: `isEditing` flag + `editedData` object na page level
- **Save**: Diff detection - wysyła tylko zmienione pola
- **Cancel**: Discard changes, exit edit mode

### Funkcjonalność
- **Create**: Dialog modal (StoryArcFormDialog)
- **Filters**: Status dropdown (planning/active/completed/abandoned)
- **Quests integration**: QuestsTab pokazuje powiązane questy (sort: created_at)
- **Backlinks**: RelatedTab pokazuje @mentions tego arc
- **Testy**: Po MVP

## 2. Struktura Plików

```
src/
├── lib/
│   └── schemas/
│       └── story-arcs.ts                    [NOWY] Zod schemas
├── components/
│   └── story-arcs/                          [NOWY FOLDER]
│       ├── StoryArcsLayout.tsx              Main container
│       ├── StoryArcsList.tsx                Left panel (30%)
│       ├── StoryArcListItem.tsx             Card na liście
│       ├── StoryArcDetailPanel.tsx          Right panel (70%)
│       ├── StoryArcsFiltersCompact.tsx      Status filter dropdown
│       ├── StoryArcFormDialog.tsx           Create dialog
│       └── tabs/                            [NOWY FOLDER]
│           ├── DetailsTab.tsx               Title, status, dates, description
│           ├── QuestsTab.tsx                Powiązane questy
│           └── RelatedTab.tsx               Backlinks (@mentions)
└── app/
    └── (dashboard)/
        └── campaigns/
            └── [id]/
                └── story-arcs/              [NOWY FOLDER]
                    └── page.tsx             Route entry point
```

## 3. Implementacja Krok po Kroku

### KROK 1: Zod Schema
**Plik**: `src/lib/schemas/story-arcs.ts`

```typescript
import { z } from 'zod';

export const createStoryArcSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description_json: z.any().nullable().optional(), // Tiptap JSONContent
  status: z
    .enum(['planning', 'active', 'completed', 'abandoned'])
    .default('planning'),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

export const updateStoryArcSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description_json: z.any().nullable().optional(),
  status: z.enum(['planning', 'active', 'completed', 'abandoned']).optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

export type StoryArcFormData = z.infer<typeof createStoryArcSchema>;
```

**Walidacja**:
- Title: required, 1-200 znaków
- Status: enum z defaultem 'planning'
- Dates: free text (fantasy calendar), optional, nullable
- Description: Tiptap JSON, optional

---

### KROK 2: StoryArcListItem (karta na liście)
**Plik**: `src/components/story-arcs/StoryArcListItem.tsx`

**UI Elements**:
```
┌──────────────────┐
│ [Active]         │  ← StatusBadge (color-coded)
│ Dragon Conspiracy│  ← Title (2 linie max, truncate)
│ 5 quests         │  ← Quest count badge
│ 📅 1 Hammer      │  ← Start date (icon + text)
└──────────────────┘
Height: ~65-70px
```

**Props**:
```typescript
interface StoryArcListItemProps {
  storyArc: StoryArcDTO;
  questCount: number; // count questów z story_arc_id
  isSelected: boolean;
  onClick: () => void;
}
```

**Styling**:
- Selected: `bg-primary/10 border-primary`
- Hover: `hover:bg-accent/50`
- StatusBadge colors:
  - planning: `bg-slate-100 text-slate-700`
  - active: `bg-emerald-100 text-emerald-700`
  - completed: `bg-green-100 text-green-700`
  - abandoned: `bg-red-100 text-red-700`

**Logika**:
- Title truncate: `line-clamp-2`
- Quest count: `{questCount} quest{questCount !== 1 ? 's' : ''}`
- Date display: `{storyArc.start_date || 'No start date'}`

---

### KROK 3: StoryArcsFiltersCompact
**Plik**: `src/components/story-arcs/StoryArcsFiltersCompact.tsx`

**UI**: Shadcn Select dropdown

**Options**:
- All (null value)
- Planning (gray badge)
- Active (emerald badge)
- Completed (green badge)
- Abandoned (red badge)

**Props**:
```typescript
interface StoryArcsFiltersCompactProps {
  filters: StoryArcFilters;
  onFiltersChange: (filters: StoryArcFilters) => void;
}
```

**Pattern**: Wzór z `QuestsFiltersCompact.tsx`

---

### KROK 4: StoryArcsList (left panel)
**Plik**: `src/components/story-arcs/StoryArcsList.tsx`

**Layout**:
```typescript
<div className="flex h-full flex-col">
  {/* Header */}
  <div className="border-b px-4 py-3">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold">Story Arcs</h2>
      <Button size="sm" onClick={onOpenCreateDialog}>
        <Plus className="mr-2 h-4 w-4" />
        Add
      </Button>
    </div>
    <StoryArcsFiltersCompact filters={filters} onFiltersChange={onFiltersChange} />
  </div>

  {/* List */}
  <ScrollArea className="flex-1">
    {isLoading ? (
      <LoadingSkeletons count={5} />
    ) : filteredStoryArcs.length === 0 ? (
      <EmptyState />
    ) : (
      filteredStoryArcs.map((arc) => (
        <StoryArcListItem
          key={arc.id}
          storyArc={arc}
          questCount={getQuestCount(arc.id)}
          isSelected={selectedStoryArcId === arc.id}
          onClick={() => onStoryArcSelect(arc.id)}
        />
      ))
    )}
  </ScrollArea>
</div>
```

**Props**:
```typescript
interface StoryArcsListProps {
  storyArcs: StoryArcDTO[];
  quests: QuestDTO[]; // dla quest count
  selectedStoryArcId: string | null;
  onStoryArcSelect: (id: string) => void;
  filters: StoryArcFilters;
  onFiltersChange: (filters: StoryArcFilters) => void;
  onOpenCreateDialog: () => void;
  isLoading: boolean;
}
```

**Logika**:
- Filter: `storyArcs.filter(arc => !filters.status || arc.status === filters.status)`
- Quest count: `quests.filter(q => q.story_arc_id === arcId).length`
- Empty states:
  - No arcs: "No story arcs yet" + CTA "Create your first story arc"
  - Filtered empty: "No {status} story arcs" + "Clear filters"

---

### KROK 5: DetailsTab (tab 1)
**Plik**: `src/components/story-arcs/tabs/DetailsTab.tsx`

**Sections**:
1. **Title** (inline edit)
2. **Status** (select: planning/active/completed/abandoned)
3. **Dates** (start_date, end_date - free text inputs)
4. **Description** (RichTextEditor with @mentions)

**Layout**:
```typescript
<div className="space-y-6 p-6">
  {/* Title */}
  <div>
    <Label>Title</Label>
    {isEditing && editedData ? (
      <Input
        value={editedData.title}
        onChange={(e) => onEditedDataChange('title', e.target.value)}
      />
    ) : (
      <h2 className="text-2xl font-bold">{viewModel.story_arc.title}</h2>
    )}
  </div>

  {/* Status */}
  <div>
    <Label>Status</Label>
    {isEditing && editedData ? (
      <Select
        value={editedData.status}
        onValueChange={(val) => onEditedDataChange('status', val)}
      >
        {/* options */}
      </Select>
    ) : (
      <StatusBadge status={viewModel.story_arc.status} />
    )}
  </div>

  {/* Dates Row */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label>Start Date</Label>
      {isEditing && editedData ? (
        <Input
          placeholder="1 Hammer, 1492 DR"
          value={editedData.start_date || ''}
          onChange={(e) => onEditedDataChange('start_date', e.target.value || null)}
        />
      ) : (
        <div className="text-sm">
          {viewModel.story_arc.start_date || <span className="text-muted-foreground">No start date</span>}
        </div>
      )}
    </div>
    <div>
      <Label>End Date</Label>
      {isEditing && editedData ? (
        <Input
          placeholder="15 Mirtul, 1492 DR"
          value={editedData.end_date || ''}
          onChange={(e) => onEditedDataChange('end_date', e.target.value || null)}
        />
      ) : (
        <div className="text-sm">
          {viewModel.story_arc.end_date || <span className="text-muted-foreground">Ongoing</span>}
        </div>
      )}
    </div>
  </div>

  {/* Description */}
  <div>
    <Label>Description</Label>
    <RichTextEditor
      value={
        isEditing && editedData
          ? editedData.description_json
          : viewModel.story_arc.description_json
      }
      onChange={(val) => onEditedDataChange('description_json', val)}
      readonly={!isEditing}
      campaignId={campaignId}
      placeholder="Describe this story arc..."
    />
  </div>
</div>
```

**Props**:
```typescript
interface DetailsTabProps {
  viewModel: StoryArcDetailsViewModel;
  campaignId: string;
  isEditing: boolean;
  editedData: EditedStoryArcData | null;
  onEditedDataChange: (field: string, value: unknown) => void;
}
```

---

### KROK 6: QuestsTab (tab 2)
**Plik**: `src/components/story-arcs/tabs/QuestsTab.tsx`

**Layout**:
```typescript
<div className="p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">Quests in this Arc</h3>
    <Badge variant="outline">{relatedQuests.length} quests</Badge>
  </div>

  {relatedQuests.length === 0 ? (
    <div className="text-center py-8 text-muted-foreground">
      <p>No quests assigned to this story arc yet</p>
      <Button variant="link" asChild>
        <Link href={`/campaigns/${campaignId}/quests`}>
          Browse Quests →
        </Link>
      </Button>
    </div>
  ) : (
    <div className="space-y-2">
      {relatedQuests.map((quest) => (
        <QuestMiniCard
          key={quest.id}
          quest={quest}
          onClick={() => router.push(`/campaigns/${campaignId}/quests?questId=${quest.id}`)}
        />
      ))}
    </div>
  )}
</div>
```

**QuestMiniCard Component**:
```typescript
// Mini karta questa (inline w QuestsTab.tsx lub osobny plik)
function QuestMiniCard({ quest, onClick }: { quest: QuestDTO; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
    >
      <ScrollText className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{quest.title}</p>
      </div>
      <Badge variant={getQuestStatusVariant(quest.status)}>
        {quest.status}
      </Badge>
    </div>
  );
}
```

**Props**:
```typescript
interface QuestsTabProps {
  storyArcId: string;
  quests: QuestDTO[]; // wszystkie questy kampanii
  campaignId: string;
}
```

**Logika**:
- Filter: `quests.filter(q => q.story_arc_id === storyArcId)`
- Sort: `.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())`
- Status badge colors: not_started (gray), active (blue), completed (green), failed (red)

---

### KROK 7: RelatedTab (tab 3)
**Plik**: `src/components/story-arcs/tabs/RelatedTab.tsx`

**Pattern**: Wzór z innych views (NPCs, Locations)

**Layout**:
```typescript
<div className="p-6">
  <h3 className="text-lg font-semibold mb-4">Related Entities</h3>

  {isLoading ? (
    <LoadingSpinner />
  ) : mentions.length === 0 ? (
    <p className="text-muted-foreground">
      This story arc is not mentioned anywhere yet
    </p>
  ) : (
    <div className="space-y-4">
      {mentions.map((mention) => (
        <MentionCard
          key={`${mention.source_entity_type}-${mention.source_entity_id}`}
          mention={mention}
          campaignId={campaignId}
        />
      ))}
    </div>
  )}
</div>
```

**API Integration**:
```typescript
const { data: mentions, isLoading } = useQuery({
  queryKey: ['entity-mentions', 'story_arc', storyArcId],
  queryFn: () => getMentionsOf('story_arc', storyArcId!),
  enabled: !!storyArcId,
});
```

**Props**:
```typescript
interface RelatedTabProps {
  storyArcId: string;
  campaignId: string;
}
```

---

### KROK 8: StoryArcDetailPanel
**Plik**: `src/components/story-arcs/StoryArcDetailPanel.tsx`

**Layout Pattern**: Wzór z `QuestDetailPanel.tsx`

```typescript
export function StoryArcDetailPanel({
  storyArcId,
  viewModel,
  campaignId,
  quests,
  isLoading,
  isEditing,
  editedData,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  onEditedDataChange,
  isUpdating,
  isDeleting,
}: StoryArcDetailPanelProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!storyArcId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          Select a story arc to view details
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!viewModel) {
    return <ErrorState />;
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col',
        isEditing && 'm-1 rounded-lg border-2 border-primary/30'
      )}
    >
      {/* Header */}
      <div className={cn('border-b px-6 py-4', isEditing && 'bg-primary/5')}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{viewModel.story_arc.title}</h1>
            <p className="text-sm text-muted-foreground">
              Created {format(new Date(viewModel.story_arc.created_at), 'PPP')}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={onSave} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="flex-1 flex flex-col">
        <TabsList className="border-b w-full justify-start rounded-none px-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="quests">
            Quests
            <Badge variant="outline" className="ml-2">
              {quests.filter(q => q.story_arc_id === storyArcId).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="details" className="mt-0">
            <DetailsTab
              viewModel={viewModel}
              campaignId={campaignId}
              isEditing={isEditing}
              editedData={editedData}
              onEditedDataChange={onEditedDataChange}
            />
          </TabsContent>

          <TabsContent value="quests" className="mt-0">
            <QuestsTab
              storyArcId={storyArcId}
              quests={quests}
              campaignId={campaignId}
            />
          </TabsContent>

          <TabsContent value="related" className="mt-0">
            <RelatedTab storyArcId={storyArcId} campaignId={campaignId} />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story Arc?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{viewModel.story_arc.title}"?
              Quests will be unlinked from this arc (story_arc_id set to NULL).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

**Props**:
```typescript
interface StoryArcDetailPanelProps {
  storyArcId: string | null;
  viewModel: StoryArcDetailsViewModel | undefined;
  campaignId: string;
  quests: QuestDTO[];
  isLoading: boolean;
  isEditing: boolean;
  editedData: EditedStoryArcData | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}
```

**ViewModel Type**:
```typescript
interface StoryArcDetailsViewModel {
  story_arc: StoryArcDTO;
  // potential future fields
}

interface EditedStoryArcData {
  title: string;
  status: 'planning' | 'active' | 'completed' | 'abandoned';
  start_date: string | null;
  end_date: string | null;
  description_json: JSONContent | null;
}
```

---

### KROK 9: StoryArcFormDialog (create only)
**Plik**: `src/components/story-arcs/StoryArcFormDialog.tsx`

**Pattern**: Wzór z `QuestFormDialog.tsx`

**Layout**:
```typescript
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
    <DialogHeader>
      <DialogTitle>Create Story Arc</DialogTitle>
      <DialogDescription>
        Organize quests into narrative threads
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-auto">
      <div className="space-y-4 px-1">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="The Dragon Conspiracy"
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={watch('status')}
            onValueChange={(val) => setValue('status', val as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              {...register('start_date')}
              placeholder="1 Hammer, 1492 DR"
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              {...register('end_date')}
              placeholder="15 Mirtul, 1492 DR"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <RichTextEditor
            value={watch('description_json')}
            onChange={(val) => setValue('description_json', val)}
            campaignId={campaignId}
            placeholder="Describe the story arc..."
          />
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Story Arc'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

**Form Handling**:
```typescript
const form = useForm<StoryArcFormData>({
  resolver: zodResolver(createStoryArcSchema),
  defaultValues: {
    title: '',
    status: 'planning',
    start_date: null,
    end_date: null,
    description_json: null,
  },
});

const onSubmit = async (data: StoryArcFormData) => {
  await createMutation.mutateAsync(data);
  form.reset();
  onClose();
};
```

---

### KROK 10: StoryArcsLayout (container)
**Plik**: `src/components/story-arcs/StoryArcsLayout.tsx`

```typescript
import { SplitLayout } from '@/components/shared/SplitLayout';
import { StoryArcsList } from './StoryArcsList';
import { StoryArcDetailPanel } from './StoryArcDetailPanel';

export function StoryArcsLayout({
  storyArcs,
  quests,
  selectedStoryArcId,
  onStoryArcSelect,
  filters,
  onFiltersChange,
  onOpenCreateDialog,
  isLoading,
  detailViewModel,
  isDetailLoading,
  isEditing,
  editedData,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  onEditedDataChange,
  campaignId,
  isUpdating,
  isDeleting,
}: StoryArcsLayoutProps) {
  return (
    <SplitLayout
      leftPanel={
        <StoryArcsList
          storyArcs={storyArcs}
          quests={quests}
          selectedStoryArcId={selectedStoryArcId}
          onStoryArcSelect={onStoryArcSelect}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onOpenCreateDialog={onOpenCreateDialog}
          isLoading={isLoading}
        />
      }
      rightPanel={
        <StoryArcDetailPanel
          storyArcId={selectedStoryArcId}
          viewModel={detailViewModel}
          campaignId={campaignId}
          quests={quests}
          isLoading={isDetailLoading}
          isEditing={isEditing}
          editedData={editedData}
          onEdit={onEdit}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          onEditedDataChange={onEditedDataChange}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      }
    />
  );
}
```

---

### KROK 11: Page.tsx (route entry point)
**Plik**: `src/app/(dashboard)/campaigns/[id]/story-arcs/page.tsx`

**State Management** (wzór z Quests):
```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StoryArcsLayout } from '@/components/story-arcs/StoryArcsLayout';
import { StoryArcFormDialog } from '@/components/story-arcs/StoryArcFormDialog';
import { useStoryArcsQuery, useStoryArcQuery, useUpdateStoryArcMutation, useDeleteStoryArcMutation } from '@/hooks/useStoryArcs';
import { useQuestsQuery } from '@/hooks/useQuests';
import type { StoryArcFilters } from '@/types/story-arcs';
import type { EditedStoryArcData, StoryArcDetailsViewModel } from '@/components/story-arcs/types';

export default function StoryArcsPage({ params }: { params: { id: string } }) {
  const campaignId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selection state
  const [selectedStoryArcId, setSelectedStoryArcId] = useState<string | null>(
    searchParams.get('storyArcId')
  );

  // Filter state
  const [filters, setFilters] = useState<StoryArcFilters>({});

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<EditedStoryArcData | null>(null);

  // Create dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Queries
  const { data: storyArcs = [], isLoading: isLoadingList } = useStoryArcsQuery(campaignId, filters);
  const { data: storyArcDetails, isLoading: isLoadingDetail } = useStoryArcQuery(selectedStoryArcId);
  const { data: quests = [] } = useQuestsQuery(campaignId);

  // Mutations
  const updateMutation = useUpdateStoryArcMutation(campaignId);
  const deleteMutation = useDeleteStoryArcMutation(campaignId);

  // Handlers
  const handleStoryArcSelect = useCallback((storyArcId: string) => {
    setSelectedStoryArcId(storyArcId);
    router.push(`/campaigns/${campaignId}/story-arcs?storyArcId=${storyArcId}`);
  }, [campaignId, router]);

  const handleEdit = useCallback(() => {
    if (storyArcDetails) {
      setEditedData({
        title: storyArcDetails.title,
        status: storyArcDetails.status as any,
        start_date: storyArcDetails.start_date,
        end_date: storyArcDetails.end_date,
        description_json: storyArcDetails.description_json,
      });
      setIsEditing(true);
    }
  }, [storyArcDetails]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedData(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editedData || !selectedStoryArcId || !storyArcDetails) return;

    // Diff detection
    const changes: Partial<EditedStoryArcData> = {};
    if (editedData.title !== storyArcDetails.title) changes.title = editedData.title;
    if (editedData.status !== storyArcDetails.status) changes.status = editedData.status;
    if (editedData.start_date !== storyArcDetails.start_date) changes.start_date = editedData.start_date;
    if (editedData.end_date !== storyArcDetails.end_date) changes.end_date = editedData.end_date;
    if (JSON.stringify(editedData.description_json) !== JSON.stringify(storyArcDetails.description_json)) {
      changes.description_json = editedData.description_json;
    }

    if (Object.keys(changes).length === 0) {
      setIsEditing(false);
      setEditedData(null);
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedStoryArcId,
      command: changes,
    });

    setIsEditing(false);
    setEditedData(null);
  }, [editedData, selectedStoryArcId, storyArcDetails, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!selectedStoryArcId) return;

    await deleteMutation.mutateAsync(selectedStoryArcId);
    setSelectedStoryArcId(null);
    router.push(`/campaigns/${campaignId}/story-arcs`);
  }, [selectedStoryArcId, deleteMutation, campaignId, router]);

  const handleEditedDataChange = useCallback((field: string, value: unknown) => {
    setEditedData((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  }, []);

  // Reset edit mode when selection changes
  useEffect(() => {
    if (isEditing) {
      setIsEditing(false);
      setEditedData(null);
    }
  }, [selectedStoryArcId]);

  // ViewModel
  const detailViewModel: StoryArcDetailsViewModel | undefined = storyArcDetails
    ? { story_arc: storyArcDetails }
    : undefined;

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb + Title */}
      <div className="border-b px-6 py-4">
        <h1 className="text-3xl font-bold">Story Arcs</h1>
      </div>

      {/* Main Layout */}
      <StoryArcsLayout
        storyArcs={storyArcs}
        quests={quests}
        selectedStoryArcId={selectedStoryArcId}
        onStoryArcSelect={handleStoryArcSelect}
        filters={filters}
        onFiltersChange={setFilters}
        onOpenCreateDialog={() => setIsCreateDialogOpen(true)}
        isLoading={isLoadingList}
        detailViewModel={detailViewModel}
        isDetailLoading={isLoadingDetail}
        isEditing={isEditing}
        editedData={editedData}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDelete}
        onEditedDataChange={handleEditedDataChange}
        campaignId={campaignId}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />

      {/* Create Dialog */}
      <StoryArcFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        campaignId={campaignId}
      />
    </div>
  );
}
```

**Key Points**:
- URL sync: `?storyArcId=xxx` w search params
- Edit mode reset: useEffect on selectedStoryArcId change
- Diff detection: tylko zmienione pola wysyłane do API
- Optimistic updates: handled by React Query mutations

---

## 4. Checklist Implementacyjny

### Foundations
- [ ] Zod schema (`story-arcs.ts`)
- [ ] TypeScript types dla view models

### Components (order of implementation)
1. [ ] `StoryArcListItem.tsx` - prosta karta
2. [ ] `StoryArcsFiltersCompact.tsx` - dropdown
3. [ ] `StoryArcsList.tsx` - left panel
4. [ ] `tabs/DetailsTab.tsx` - podstawowy tab
5. [ ] `tabs/QuestsTab.tsx` - lista questów
6. [ ] `tabs/RelatedTab.tsx` - backlinks
7. [ ] `StoryArcDetailPanel.tsx` - detail panel z tabs
8. [ ] `StoryArcFormDialog.tsx` - create dialog
9. [ ] `StoryArcsLayout.tsx` - container
10. [ ] `page.tsx` - route entry point

### Integration & Polish
- [ ] URL sync (search params)
- [ ] Loading states (skeletons)
- [ ] Empty states (no arcs, filtered empty)
- [ ] Error handling (toast notifications)
- [ ] Delete confirmation dialog
- [ ] Edit mode visual styling

### Post-MVP (deferred)
- [ ] Testy jednostkowe (Vitest)
- [ ] Testy E2E (Playwright)
- [ ] Accessibility audit
- [ ] Responsive (mobile)

---

## 5. Kluczowe Wzorce do Zachowania

### Pattern 1: Edit Mode Flow
```typescript
// ALWAYS follow this pattern for edit mode
1. Click Edit → copy data to editedData state
2. User changes → update editedData[field]
3. Click Save → diff editedData vs original → send changes
4. Click Cancel → clear editedData → exit edit mode
5. Selection change → auto-exit edit mode
```

### Pattern 2: Conditional Rendering
```typescript
// ALWAYS use this pattern for fields
{isEditing && editedData ? (
  <Input value={editedData.field} onChange={...} />
) : (
  <div>{viewModel.field}</div>
)}
```

### Pattern 3: Status Badge Colors
```typescript
const statusColors = {
  planning: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-green-100 text-green-700',
  abandoned: 'bg-red-100 text-red-700',
};
```

### Pattern 4: Empty States
```typescript
// Different messages for different empty scenarios
- No arcs at all: "Create your first story arc"
- Filtered empty: "No {status} story arcs found"
- No quests in arc: "No quests assigned to this arc"
```

---

## 6. Różnice vs Oryginalny Plan

| Aspekt | Oryginalny Plan | Finalna Decyzja |
|--------|-----------------|-----------------|
| Layout | Accordion (full width) | Split 30/70 |
| Progress | Progress bar (%) | Quest count only |
| Auto-expand | Active arc | Żaden |
| Edycja dat | Inline hover edit | Edit mode only |
| Obrazki | - | Skip (bez image_url) |
| Quests sort | - | created_at (prosta lista) |
| RelatedTab | Optional | TAK (backlinks) |
| Testy | W trakcie | Po MVP |

---

## 7. API & Hooks (już gotowe)

### Dostępne Hooks
```typescript
useStoryArcsQuery(campaignId, filters?) // lista
useStoryArcQuery(storyArcId) // detale
useCreateStoryArcMutation(campaignId)
useUpdateStoryArcMutation(campaignId)
useDeleteStoryArcMutation(campaignId)
```

### Dostępne API Functions
```typescript
getStoryArcs(campaignId, filters?) → StoryArcDTO[]
getStoryArc(storyArcId) → StoryArcDTO
createStoryArc(campaignId, command) → StoryArcDTO
updateStoryArc(storyArcId, command) → StoryArcDTO
deleteStoryArc(storyArcId) → void
```

### Dostępne Shared Components
- `SplitLayout` - 30/70 split wrapper
- `RichTextEditor` - Tiptap z @mentions
- `getMentionsOf()` - backlinks API

---

## 8. Pytania Otwarte (do rozwiązania później)

- Czy dodać keyboard shortcuts (Ctrl+E dla edit, Escape dla cancel)?
- Czy dodać bulk operations (multi-select + bulk delete/status change)?
- Czy dodać sorting options dla listy (by date, by title, by status)?
- Czy dodać search/filter by title w left panel?

---

**Status**: ✅ Ready for implementation
**Pattern**: Split Layout 30/70 (consistent with Quests/NPCs/Locations)
**MVP Scope**: Create, Read, Update, Delete + Filters + Tabs (Details/Quests/Related)
**Post-MVP**: Tests, Responsive, Advanced features
