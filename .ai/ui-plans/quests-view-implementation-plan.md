# Plan implementacji widoku Quests (Split View Pattern)

## 1. Przegląd

Widok Quests zapewnia kompleksowe narzędzie do zarządzania zadaniami (questami) w kampanii RPG. Głównym celem jest umożliwienie Mistrzowi Gry tworzenia, śledzenia i organizowania questów z strukturalnymi nagrodami (gold, items, XP, other), celami (objectives) w formie checklisty oraz przypisaniem do Story Arc (wątków fabularnych) i Quest Giver (NPC).

**Architektura widoku:** Split view layout (30% lista | 70% detail panel) - wzorowany na NPCs view pattern. Widok oferuje filtrowalną listę questów z search i sort, detail panel z 4 tabami (Details | Objectives | Rewards | Related), inline editing w detail panel, oraz automatyczne ekstraktowanie powiązanych encji z @mentions w opisie.

**Kluczowe różnice vs grid + slideover:**
- Persistent detail panel zamiast ephemeral slideover (lepszy UX podczas sesji)
- 70% ekranu dla szczegółów questa (vs 700px slideover)
- Inline editing w detail panel (jak NPCs) zamiast oddzielnego edit dialog
- Mixed list z visual indicators (MAIN/SIDE badges) zamiast grouped sections

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/campaigns/[id]/quests`

Dynamiczny parametr `[id]` reprezentuje identyfikator kampanii (campaign ID).

**URL Parameters (synchronizacja z state):**
- `?selectedId=[questId]` - wybrany quest w detail panel (jak NPCs view)
- Przykład: `/campaigns/abc123/quests?selectedId=def456`

**Navigation handling:**
- Router.push z `{ scroll: false }` aby zapobiec scrollowaniu przy zmianie selectedId
- useEffect reset edit mode przy zmianie selectedId

## 3. Struktura komponentów

```
QuestsView (główny widok, src/app/(dashboard)/campaigns/[id]/quests/page.tsx)
├── QuestsHeader
│   ├── Breadcrumb (shadcn)
│   ├── H1: "Quests"
│   └── Button: "+ New Quest" (trigger create dialog, emerald)
└── QuestsLayout (split view container, 30/70)
    ├── LEFT PANEL (30%, w-[30%] border-r)
    │   └── QuestsList
    │       ├── SearchBar (search by title/description, client-side)
    │       ├── SortDropdown (Recent/Name A-Z/Name Z-A/Priority/Progress)
    │       ├── QuestsFiltersCompact (Popover)
    │       │   ├── Status filter (RadioGroup: all/not_started/active/completed/failed)
    │       │   ├── Quest Type filter (RadioGroup: all/main/side)
    │       │   └── Story Arc filter (Select: all/specific arc)
    │       ├── Scrollable list (overflow-y-auto)
    │       │   └── QuestListItem[] (buttons with selection state)
    │       │       ├── Status dot (emerald/gray/green/red)
    │       │       ├── Quest Type badge (MAIN emerald / SIDE gray, opcjonalnie)
    │       │       ├── Title (font-medium truncate)
    │       │       ├── Progress bar + text ("3/5 objectives, 60%")
    │       │       ├── Story Arc badge (fioletowy, opcjonalnie)
    │       │       └── Rewards icons (compact: 💰 500g ⭐ Ring)
    │       └── Footer stats ("8 quests, 3 active")
    └── RIGHT PANEL (70%, flex-1)
        └── QuestDetailPanel
            ├── Empty state (no quest selected)
            ├── Loading state (skeleton)
            ├── 404 state (quest not found)
            └── Content state
                ├── Header (conditional border/bg when editing)
                │   ├── Left: Title (H2, inline editable) + Quest Type badge + Status badge
                │   ├── Center: Story Arc (editable select) + Progress bar
                │   └── Right: [Edit] [Delete] buttons
                ├── Delete Confirmation Dialog
                └── Tabs Container (Shadcn Tabs)
                    ├── TabsList: Details | Objectives | Rewards | Related
                    └── Tab Contents (overflow-y-auto)
                        ├── DetailsTab
                        │   ├── Description (RichTextEditor, @mentions)
                        │   ├── Quest Giver (NPC select, editable)
                        │   ├── Key Locations (read-only, extracted from @mentions)
                        │   ├── Notes & Clues (textarea)
                        │   └── Dates (start/deadline, opcjonalnie, react-day-picker)
                        ├── ObjectivesTab
                        │   ├── Progress summary header ("5 total, 3 completed - 60%")
                        │   ├── ObjectiveItem[] (checkbox + text + notes + delete)
                        │   └── "+ Add Objective" button
                        ├── RewardsTab
                        │   ├── 2x2 Grid: Gold | XP | Items | Other
                        │   └── Helper text ("Rewards given when quest completed")
                        └── RelatedTab
                            ├── Related Entities (auto-extracted from @mentions)
                            │   └── EntityLink[] grouped by type (NPCs/Locations/Items)
                            └── Backlinks ("Mentioned In")
                                └── BacklinkItem[] (source type + name + link)
```

**Additional Components:**
- `QuestFormDialog` (Shadcn Dialog) - dla create/edit (mode: 'create' | 'edit')
- `StatusBadge` (reusable) - emerald/gray/green/red
- `QuestTypeBadge` (reusable) - MAIN (emerald) / SIDE (gray)
- `RichTextEditor` (reusable, shared/) - Tiptap z @mentions

## 4. Szczegóły komponentów

### 4.1. QuestsView (główny widok, page.tsx)

**Opis:** Root komponent widoku, odpowiada za orchestrację wszystkich pozostałych komponentów oraz zarządzanie wysokopoziomowym stanem widoku (selectedQuestId, edit mode, dialogs, filters). Wzorowany na NPCs page.

**Główne elementy:**
- Kontener typu "flex flex-col h-full"
- QuestsHeader jako pierwsza sekcja
- QuestsLayout zajmujący pozostałą przestrzeń (flex-1)
- QuestFormDialog renderowany warunkowo (otwarty po kliknięciu "New Quest" lub "Edit")

**State Management:**
```typescript
const [selectedQuestId, setSelectedQuestId] = useState<string | null>(
  searchParams.get('selectedId') || null
);
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [filters, setFilters] = useState<QuestFilters>({});
const [isEditing, setIsEditing] = useState(false);
const [editedData, setEditedData] = useState<EditedQuestData | null>(null);
```

**URL Synchronization:**
```typescript
// Sync selectedQuestId to URL
useEffect(() => {
  if (selectedQuestId) {
    router.push(`/campaigns/${campaignId}/quests?selectedId=${selectedQuestId}`, {
      scroll: false,
    });
  } else {
    router.push(`/campaigns/${campaignId}/quests`, { scroll: false });
  }
}, [selectedQuestId, campaignId]);

// Reset edit mode on selection change
useEffect(() => {
  if (isEditing) {
    setIsEditing(false);
    setEditedData(null);
  }
}, [selectedQuestId]);
```

**Queries:**
- `useQuestsQuery(campaignId, filters)` - lista questów z filtrowaniem
- `useQuestDetailsQuery(selectedQuestId)` - szczegóły questa (if selected)
- `useNPCsQuery(campaignId)` - dla quest_giver select
- `useStoryArcsQuery(campaignId)` - dla story arc select i filtrów

**Mutations:**
- `useCreateQuestMutation()` - z optimistic update
- `useUpdateQuestMutation()` - dla inline edits i full save
- `useDeleteQuestMutation()` - z confirm dialog

**Data Transformation:**
```typescript
const questsWithProgress: QuestCardViewModel[] = useMemo(() => {
  return quests.map((quest) => ({
    quest,
    objectivesProgress: calculateObjectivesProgress(quest.objectives_json),
    rewardsSummary: formatRewardsSummary(quest.rewards_json),
    questGiverName: quest.quest_giver?.name, // z joined query
    storyArcName: quest.story_arc?.title,
  }));
}, [quests]);
```

**Save Handler (edit mode):**
```typescript
const handleSave = useCallback(async () => {
  if (!editedData || !viewModel) return;

  // Compare and extract only changed fields
  const changes: UpdateQuestCommand = {};
  if (editedData.title !== viewModel.quest.title) changes.title = editedData.title;
  if (JSON.stringify(editedData.description_json) !== JSON.stringify(viewModel.quest.description_json))
    changes.description_json = editedData.description_json;
  // ... other fields

  if (Object.keys(changes).length === 0) {
    setIsEditing(false);
    return;
  }

  await updateQuestMutation.mutateAsync({
    questId: selectedQuestId!,
    command: changes,
  });

  setIsEditing(false);
  setEditedData(null);
}, [editedData, viewModel, selectedQuestId]);
```

**Propsy:**
- `params: { id: string }` - parametr z Next.js App Router (campaign ID)
- `searchParams: { selectedId?: string }` - URL query params

### 4.2. QuestsLayout (container)

**Opis:** Layout container dla split view (30/70). Reusable orchestration component podobny do NPCsLayout.

**Struktura:**
```tsx
<div className="flex-1 flex gap-6 overflow-hidden">
  {/* LEFT PANEL - Quest List (30%) */}
  <div className="w-[30%] border-r overflow-hidden">
    <QuestsList {...listProps} />
  </div>

  {/* RIGHT PANEL - Detail Panel (70%) */}
  <div className="flex-1 overflow-hidden">
    <QuestDetailPanel {...detailProps} />
  </div>
</div>
```

**Propsy:**
```typescript
interface QuestsLayoutProps {
  // List props
  quests: QuestCardViewModel[];
  selectedQuestId: string | null;
  onQuestSelect: (questId: string) => void;
  npcs: Array<{ id: string; name: string }>; // for quest_giver filter/select
  storyArcs: Array<{ id: string; title: string }>; // for filter/select
  filters: QuestFilters;
  onFiltersChange: (filters: QuestFilters) => void;
  isLoading: boolean;

  // Detail panel props
  detailViewModel: QuestDetailsViewModel | undefined;
  isDetailLoading: boolean;
  isEditing: boolean;
  editedData: EditedQuestData | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  campaignId: string;
  isUpdating?: boolean;
  isDeleting?: boolean;
}
```

### 4.3. QuestsList (left panel, 30%)

**Opis:** Lista questów z search, sort i filters. Wzorowana na NPCsList.

**Główne elementy:**
```tsx
<div className="flex flex-col h-full">
  {/* Search bar */}
  <div className="px-3 pt-3 pb-2">
    <Input placeholder="Search quests..." value={localSearch} onChange={...} />
  </div>

  {/* Sort dropdown */}
  <div className="px-3 pb-2">
    <Select value={sortBy} onValueChange={setSortBy}>
      <option value="recent">Recent</option>
      <option value="name-asc">Name (A-Z)</option>
      <option value="name-desc">Name (Z-A)</option>
      <option value="priority">Priority (Active first)</option>
      <option value="progress">Progress (%)</option>
    </Select>
  </div>

  {/* Filters */}
  <div className="px-3 pb-3 border-b">
    <QuestsFiltersCompact filters={filters} onFiltersChange={onFiltersChange} />
  </div>

  {/* Scrollable list */}
  <div className="flex-1 overflow-y-auto px-3 space-y-1.5">
    {isLoading && <SkeletonQuestItems count={5} />}
    {!isLoading && filteredAndSortedQuests.length === 0 && (
      <EmptyState message="No quests found" />
    )}
    {!isLoading && filteredAndSortedQuests.map(quest => (
      <QuestListItem
        key={quest.quest.id}
        quest={quest}
        isSelected={quest.quest.id === selectedQuestId}
        onClick={() => onQuestSelect(quest.quest.id)}
      />
    ))}
  </div>

  {/* Footer stats */}
  <div className="px-3 py-2 border-t text-xs text-muted-foreground">
    {quests.length} quests, {activeCount} active
  </div>
</div>
```

**Client-side Search & Sort:**
```typescript
const [localSearch, setLocalSearch] = useState('');
const [sortBy, setSortBy] = useState<'recent' | 'name-asc' | 'name-desc' | 'priority' | 'progress'>('recent');

const filteredAndSortedQuests = useMemo(() => {
  // Filter by search
  let filtered = quests;
  if (localSearch) {
    filtered = quests.filter(q =>
      q.quest.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      q.quest.description_json?.toString().toLowerCase().includes(localSearch.toLowerCase())
    );
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.quest.created_at).getTime() - new Date(a.quest.created_at).getTime();
      case 'name-asc':
        return a.quest.title.localeCompare(b.quest.title);
      case 'name-desc':
        return b.quest.title.localeCompare(a.quest.title);
      case 'priority':
        const priorityMap = { active: 0, not_started: 1, completed: 2, failed: 3 };
        return priorityMap[a.quest.status] - priorityMap[b.quest.status];
      case 'progress':
        return b.objectivesProgress.percentage - a.objectivesProgress.percentage;
      default:
        return 0;
    }
  });

  return sorted;
}, [quests, localSearch, sortBy]);
```

**Propsy:**
```typescript
interface QuestsListProps {
  quests: QuestCardViewModel[];
  selectedQuestId: string | null;
  onQuestSelect: (questId: string) => void;
  npcs: Array<{ id: string; name: string }>;
  storyArcs: Array<{ id: string; title: string }>;
  filters: QuestFilters;
  onFiltersChange: (filters: QuestFilters) => void;
  isLoading: boolean;
}
```

### 4.4. QuestListItem (individual item in list)

**Opis:** Button reprezentujący pojedynczy quest w liście. Wyświetla status, typ, tytuł, progress, story arc i rewards summary. Wzorowany na NPCListItem.

**Layout:**
```tsx
<Button
  variant="ghost"
  className={cn(
    "w-full px-3 py-2.5 flex items-start gap-3 relative border-l-4 transition-colors",
    isSelected
      ? "bg-accent border-l-primary shadow-sm"
      : "bg-background border-l-transparent hover:bg-accent hover:border-l-accent-foreground/20"
  )}
  onClick={() => onClick(quest.quest.id)}
>
  {/* Status dot (absolute positioned) */}
  <div className={cn(
    "absolute top-2 left-2 w-2 h-2 rounded-full",
    quest.quest.status === 'active' && "bg-emerald-500",
    quest.quest.status === 'not_started' && "bg-gray-400",
    quest.quest.status === 'completed' && "bg-green-500",
    quest.quest.status === 'failed' && "bg-red-500"
  )} />

  {/* Content */}
  <div className="flex-1 min-w-0 space-y-1 pl-4">
    {/* Title + Quest Type badge */}
    <div className="flex items-center gap-2">
      <h3 className="font-medium truncate">{quest.quest.title}</h3>
      {quest.quest.quest_type === 'main' && (
        <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
          MAIN
        </Badge>
      )}
    </div>

    {/* Progress bar + text */}
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">
        {quest.objectivesProgress.completed}/{quest.objectivesProgress.total} objectives ({quest.objectivesProgress.percentage}%)
      </div>
      <Progress value={quest.objectivesProgress.percentage} className="h-1" />
    </div>

    {/* Meta info (Story Arc + Rewards) */}
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {quest.storyArcName && (
        <Badge variant="outline" className="text-purple-600 bg-purple-50">
          {quest.storyArcName}
        </Badge>
      )}
      <div className="flex items-center gap-1.5">
        {quest.quest.rewards_json?.gold && <span>💰 {quest.quest.rewards_json.gold}g</span>}
        {quest.quest.rewards_json?.xp && <span>⭐ {quest.quest.rewards_json.xp} XP</span>}
        {quest.quest.rewards_json?.items?.length > 0 && (
          <span>📦 {quest.quest.rewards_json.items.length} items</span>
        )}
      </div>
    </div>
  </div>
</Button>
```

**Propsy:**
```typescript
interface QuestListItemProps {
  quest: QuestCardViewModel;
  isSelected: boolean;
  onClick: (questId: string) => void;
}
```

### 4.5. QuestsFiltersCompact (popover filters)

**Opis:** Compact filters w Popover (wzór NPCFiltersCompact). Obsługuje status, quest_type i story_arc.

**Struktura:**
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" size="sm">
      Filters
      {activeFilterCount > 0 && (
        <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
      )}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    {/* Status filter */}
    <div className="space-y-2">
      <Label>Status</Label>
      <RadioGroup value={filters.status || 'all'} onValueChange={handleStatusChange}>
        <RadioGroupItem value="all" label="All statuses" />
        <RadioGroupItem value="not_started" label="Not Started" />
        <RadioGroupItem value="active" label="Active" />
        <RadioGroupItem value="completed" label="Completed" />
        <RadioGroupItem value="failed" label="Failed" />
      </RadioGroup>
    </div>

    {/* Quest Type filter */}
    <div className="space-y-2 mt-4">
      <Label>Quest Type</Label>
      <RadioGroup value={filters.quest_type || 'all'} onValueChange={handleQuestTypeChange}>
        <RadioGroupItem value="all" label="All types" />
        <RadioGroupItem value="main" label="Main Quests" />
        <RadioGroupItem value="side" label="Side Quests" />
      </RadioGroup>
    </div>

    {/* Story Arc filter */}
    <div className="space-y-2 mt-4">
      <Label>Story Arc</Label>
      <Select value={filters.story_arc_id || 'all'} onValueChange={handleStoryArcChange}>
        <SelectItem value="all">All story arcs</SelectItem>
        {storyArcs.map(arc => (
          <SelectItem key={arc.id} value={arc.id}>{arc.title}</SelectItem>
        ))}
      </Select>
    </div>

    {/* Active filters chips */}
    {activeFilterCount > 0 && (
      <div className="mt-4 pt-4 border-t space-y-2">
        <div className="text-sm font-medium">Active Filters:</div>
        <div className="flex flex-wrap gap-1.5">
          {filters.status && (
            <Badge variant="secondary">
              Status: {filters.status}
              <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeFilter('status')} />
            </Badge>
          )}
          {filters.quest_type && (
            <Badge variant="secondary">
              Type: {filters.quest_type}
              <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeFilter('quest_type')} />
            </Badge>
          )}
          {filters.story_arc_id && (
            <Badge variant="secondary">
              Arc: {storyArcs.find(a => a.id === filters.story_arc_id)?.title}
              <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeFilter('story_arc_id')} />
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Clear all filters
        </Button>
      </div>
    )}
  </PopoverContent>
</Popover>
```

**Active Filter Count:**
```typescript
const activeFilterCount = useMemo(() => {
  let count = 0;
  if (filters.status) count++;
  if (filters.quest_type) count++;
  if (filters.story_arc_id) count++;
  return count;
}, [filters]);
```

**Propsy:**
```typescript
interface QuestsFiltersCompactProps {
  filters: QuestFilters;
  storyArcs: Array<{ id: string; title: string }>;
  onFiltersChange: (filters: QuestFilters) => void;
}
```

### 4.6. QuestDetailPanel (right panel, 70%)

**Opis:** Detail panel z 4 tabami (Details | Objectives | Rewards | Related). Wzorowany na NPCDetailPanel. Obsługuje inline editing w edit mode.

**States:**
```tsx
// Empty state (no quest selected)
{!questId && (
  <div className="flex-1 flex items-center justify-center text-center">
    <div className="space-y-2">
      <Scroll className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Select a quest to view details</p>
    </div>
  </div>
)}

// Loading state
{questId && isLoading && <SkeletonQuestDetail />}

// 404 state
{questId && !isLoading && !viewModel && (
  <div className="flex-1 flex items-center justify-center text-center">
    <div className="space-y-2">
      <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
      <p className="font-medium">Quest not found</p>
    </div>
  </div>
)}

// Content state
{questId && !isLoading && viewModel && (
  <div className={cn(
    "flex flex-col h-full",
    isEditing && "border-2 border-primary/30 rounded-lg m-1"
  )}>
    {/* Header */}
    <div className={cn(
      "px-6 py-4 border-b",
      isEditing && "bg-primary/5"
    )}>
      {/* ... header content */}
    </div>

    {/* Tabs */}
    <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
      <TabsList className="px-6">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="objectives">Objectives</TabsTrigger>
        <TabsTrigger value="rewards">Rewards</TabsTrigger>
        <TabsTrigger value="related">Related</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <TabsContent value="details">
          <DetailsTab {...detailsProps} />
        </TabsContent>
        <TabsContent value="objectives">
          <ObjectivesTab {...objectivesProps} />
        </TabsContent>
        <TabsContent value="rewards">
          <RewardsTab {...rewardsProps} />
        </TabsContent>
        <TabsContent value="related">
          <RelatedTab {...relatedProps} />
        </TabsContent>
      </div>
    </Tabs>
  </div>
)}
```

**Header Content:**
```tsx
<div className="space-y-3">
  {/* Title row + badges */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {/* Title (inline editable in edit mode) */}
      {isEditing ? (
        <Input
          value={editedData.title}
          onChange={(e) => onEditedDataChange('title', e.target.value)}
          className="text-2xl font-bold"
        />
      ) : (
        <h2 className="text-2xl font-bold">{viewModel.quest.title}</h2>
      )}

      {/* Quest Type badge */}
      {viewModel.quest.quest_type === 'main' && (
        <Badge variant="outline" className="text-emerald-600 bg-emerald-50">
          MAIN QUEST
        </Badge>
      )}

      {/* Status badge */}
      <StatusBadge status={viewModel.quest.status} />
    </div>

    {/* Action buttons */}
    <div className="flex gap-2">
      {!isEditing ? (
        <>
          <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteClick}>Delete</Button>
        </>
      ) : (
        <>
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>Cancel</Button>
          <Button size="sm" onClick={onSave} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </>
      )}
    </div>
  </div>

  {/* Story Arc + Progress */}
  <div className="flex items-center gap-4">
    {/* Story Arc select (editable in edit mode) */}
    <div className="flex items-center gap-2">
      <Label>Story Arc:</Label>
      {isEditing ? (
        <Select
          value={editedData.story_arc_id || 'none'}
          onValueChange={(value) => onEditedDataChange('story_arc_id', value === 'none' ? null : value)}
        >
          <SelectItem value="none">None</SelectItem>
          {storyArcs.map(arc => (
            <SelectItem key={arc.id} value={arc.id}>{arc.title}</SelectItem>
          ))}
        </Select>
      ) : (
        <Badge variant="outline" className="text-purple-600 bg-purple-50">
          {viewModel.storyArcName || 'None'}
        </Badge>
      )}
    </div>

    {/* Progress bar */}
    <div className="flex-1 flex items-center gap-2">
      <Label>Progress:</Label>
      <Progress value={viewModel.objectivesProgress.percentage} className="flex-1" />
      <span className="text-sm text-muted-foreground">
        {viewModel.objectivesProgress.completed}/{viewModel.objectivesProgress.total} ({viewModel.objectivesProgress.percentage}%)
      </span>
    </div>
  </div>
</div>
```

**Delete Confirmation:**
```tsx
<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Quest</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete "{viewModel.quest.title}"? This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDeleteConfirm}
        disabled={isDeleting}
        className="bg-destructive text-destructive-foreground"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Propsy:**
```typescript
interface QuestDetailPanelProps {
  questId: string | null;
  viewModel: QuestDetailsViewModel | undefined;
  campaignId: string;
  npcs: Array<{ id: string; name: string }>;
  storyArcs: Array<{ id: string; title: string }>;
  isLoading: boolean;
  isEditing: boolean;
  editedData: EditedQuestData | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}
```

### 4.7. DetailsTab (tab content)

**Opis:** Pierwszy tab w detail panel. Zawiera description, quest giver, key locations, notes i dates.

**Content:**
```tsx
<div className="space-y-6">
  {/* Description */}
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label>Description</Label>
      {!isEditing && (
        <Button variant="ghost" size="sm" onClick={() => setDescriptionEditing(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      )}
    </div>
    <RichTextEditor
      value={isEditing ? editedData.description_json : viewModel.quest.description_json}
      onChange={(value) => onEditedDataChange('description_json', value)}
      campaignId={campaignId}
      editable={isEditing || isDescriptionEditing}
      onBlur={() => setDescriptionEditing(false)}
    />
  </div>

  {/* Quest Giver */}
  <div className="space-y-2">
    <Label>Quest Giver</Label>
    {isEditing ? (
      <Select
        value={editedData.quest_giver_id || 'none'}
        onValueChange={(value) => onEditedDataChange('quest_giver_id', value === 'none' ? null : value)}
      >
        <SelectItem value="none">None</SelectItem>
        {npcs.map(npc => (
          <SelectItem key={npc.id} value={npc.id}>{npc.name}</SelectItem>
        ))}
      </Select>
    ) : (
      <div className="flex items-center gap-2">
        {viewModel.questGiverName ? (
          <>
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{viewModel.questGiverName}</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">No quest giver assigned</span>
        )}
      </div>
    )}
  </div>

  {/* Key Locations (auto-extracted from @mentions) */}
  <div className="space-y-2">
    <Label>Key Locations</Label>
    {viewModel.relatedLocations.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {viewModel.relatedLocations.map(location => (
          <Badge key={location.id} variant="outline" className="cursor-pointer">
            <MapPin className="h-3 w-3 mr-1" />
            {location.name}
          </Badge>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">No locations mentioned</p>
    )}
  </div>

  {/* Notes & Clues */}
  <div className="space-y-2">
    <Label>Notes & Clues</Label>
    {isEditing ? (
      <Textarea
        value={editedData.notes || ''}
        onChange={(e) => onEditedDataChange('notes', e.target.value)}
        placeholder="Important clues, hints, or DM notes..."
        rows={4}
      />
    ) : (
      <div className="text-sm whitespace-pre-wrap">
        {viewModel.quest.notes || <span className="text-muted-foreground">No notes</span>}
      </div>
    )}
  </div>

  {/* Dates (optional) */}
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label>Start Date (in-game)</Label>
      {isEditing ? (
        <Input
          type="text"
          value={editedData.start_date || ''}
          onChange={(e) => onEditedDataChange('start_date', e.target.value)}
          placeholder="e.g., 15 Mirtul 1492 DR"
        />
      ) : (
        <div className="text-sm">{viewModel.quest.start_date || '—'}</div>
      )}
    </div>
    <div className="space-y-2">
      <Label>Deadline (in-game)</Label>
      {isEditing ? (
        <Input
          type="text"
          value={editedData.deadline || ''}
          onChange={(e) => onEditedDataChange('deadline', e.target.value)}
          placeholder="e.g., 20 Mirtul 1492 DR"
        />
      ) : (
        <div className="text-sm">{viewModel.quest.deadline || '—'}</div>
      )}
    </div>
  </div>
</div>
```

**Propsy:**
```typescript
interface DetailsTabProps {
  viewModel: QuestDetailsViewModel;
  campaignId: string;
  npcs: Array<{ id: string; name: string }>;
  isEditing: boolean;
  editedData: EditedQuestData;
  onEditedDataChange: (field: string, value: unknown) => void;
}
```

### 4.8. ObjectivesTab (tab content)

**Opis:** Drugi tab - zarządzanie objectives questa (checklist). Inline editable z auto-save w non-edit mode.

**Content:**
```tsx
<div className="space-y-4">
  {/* Progress summary header */}
  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
    <div className="text-lg font-medium">
      {viewModel.objectivesProgress.total} Objectives
      ({viewModel.objectivesProgress.completed} completed, {viewModel.objectivesProgress.percentage}%)
    </div>
    <Progress value={viewModel.objectivesProgress.percentage} className="w-32" />
  </div>

  {/* Objectives list */}
  <div className="space-y-2">
    {objectives.map((objective, index) => (
      <ObjectiveItem
        key={index}
        objective={objective}
        index={index}
        isEditing={isEditing}
        onToggle={(idx) => handleObjectiveToggle(idx)}
        onTextChange={(idx, text) => handleObjectiveTextChange(idx, text)}
        onDelete={(idx) => handleObjectiveDelete(idx)}
      />
    ))}
  </div>

  {/* Add objective button */}
  <Button
    variant="outline"
    size="sm"
    onClick={handleAddObjective}
    className="w-full"
  >
    <Plus className="h-4 w-4 mr-2" />
    Add Objective
  </Button>

  {/* Helper text */}
  <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
    💡 Completing all objectives doesn't auto-complete the quest. Manually mark quest as complete when finished.
  </div>
</div>
```

**ObjectiveItem Component:**
```tsx
<div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors group">
  {/* Checkbox */}
  <Checkbox
    checked={objective.completed}
    onCheckedChange={() => onToggle(index)}
    disabled={!isEditing && isUpdating}
  />

  {/* Text (inline editable) */}
  <div className="flex-1 min-w-0">
    {isEditingText ? (
      <Input
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onBlur={handleTextBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleTextBlur();
          if (e.key === 'Escape') {
            setEditText(objective.text);
            setIsEditingText(false);
          }
        }}
        autoFocus
      />
    ) : (
      <div
        className={cn(
          "cursor-pointer",
          objective.completed && "line-through text-muted-foreground"
        )}
        onClick={() => setIsEditingText(true)}
      >
        {objective.text}
      </div>
    )}

    {/* Notes (expandable, optional) */}
    {objective.notes && (
      <div className="mt-1 text-xs text-muted-foreground">
        {objective.notes}
      </div>
    )}
  </div>

  {/* Delete button (visible on hover) */}
  <Button
    variant="ghost"
    size="sm"
    className="opacity-0 group-hover:opacity-100 transition-opacity"
    onClick={() => onDelete(index)}
  >
    <Trash2 className="h-4 w-4 text-destructive" />
  </Button>
</div>
```

**Auto-save Handlers:**
```typescript
const handleObjectiveToggle = useCallback(async (index: number) => {
  const updated = [...objectives];
  updated[index].completed = !updated[index].completed;

  await updateQuestMutation.mutateAsync({
    questId: viewModel.quest.id,
    command: { objectives_json: updated },
  });
}, [objectives, viewModel.quest.id]);

const handleObjectiveTextChange = useCallback(async (index: number, newText: string) => {
  if (!newText.trim()) return;

  const updated = [...objectives];
  updated[index].text = newText.trim();

  await updateQuestMutation.mutateAsync({
    questId: viewModel.quest.id,
    command: { objectives_json: updated },
  });
}, [objectives, viewModel.quest.id]);

const handleObjectiveDelete = useCallback(async (index: number) => {
  const updated = objectives.filter((_, i) => i !== index);

  await updateQuestMutation.mutateAsync({
    questId: viewModel.quest.id,
    command: { objectives_json: updated },
  });
}, [objectives, viewModel.quest.id]);

const handleAddObjective = useCallback(async () => {
  const updated = [...objectives, { text: 'New objective', completed: false }];

  await updateQuestMutation.mutateAsync({
    questId: viewModel.quest.id,
    command: { objectives_json: updated },
  });

  // Auto-focus new objective for editing
  setTimeout(() => {
    const inputs = document.querySelectorAll('[data-objective-input]');
    const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
    lastInput?.focus();
  }, 100);
}, [objectives, viewModel.quest.id]);
```

**Propsy:**
```typescript
interface ObjectivesTabProps {
  viewModel: QuestDetailsViewModel;
  isEditing: boolean;
  isUpdating: boolean;
  onObjectivesChange: (objectives: QuestObjective[]) => Promise<void>;
}
```

### 4.9. RewardsTab (tab content)

**Opis:** Trzeci tab - zarządzanie nagrodami questa (gold, XP, items, other). 2x2 grid layout.

**Content:**
```tsx
<div className="space-y-6">
  {/* Rewards grid (2x2) */}
  <div className="grid grid-cols-2 gap-4">
    {/* Gold */}
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-yellow-600" />
        Gold
      </Label>
      {isEditing ? (
        <Input
          type="number"
          min="0"
          value={editedData.rewards_json?.gold || ''}
          onChange={(e) => handleRewardChange('gold', parseInt(e.target.value) || null)}
          placeholder="0"
        />
      ) : (
        <div className="text-lg font-medium">
          {viewModel.quest.rewards_json?.gold || 0} gp
        </div>
      )}
    </div>

    {/* XP */}
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-600" />
        Experience Points
      </Label>
      {isEditing ? (
        <Input
          type="number"
          min="0"
          value={editedData.rewards_json?.xp || ''}
          onChange={(e) => handleRewardChange('xp', parseInt(e.target.value) || null)}
          placeholder="0"
        />
      ) : (
        <div className="text-lg font-medium">
          {viewModel.quest.rewards_json?.xp || 0} XP
        </div>
      )}
    </div>

    {/* Items */}
    <div className="space-y-2 col-span-2">
      <Label className="flex items-center gap-2">
        <Package className="h-4 w-4 text-blue-600" />
        Items
      </Label>
      {isEditing ? (
        <Textarea
          value={editedData.rewards_json?.items?.join(', ') || ''}
          onChange={(e) => {
            const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            handleRewardChange('items', items.length > 0 ? items : null);
          }}
          placeholder="e.g., Ring of Protection, +1 Longsword, Healing Potion x2"
          rows={2}
        />
      ) : (
        <div className="text-sm">
          {viewModel.quest.rewards_json?.items?.length > 0 ? (
            <ul className="list-disc list-inside">
              {viewModel.quest.rewards_json.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <span className="text-muted-foreground">No items</span>
          )}
        </div>
      )}
    </div>

    {/* Other rewards */}
    <div className="space-y-2 col-span-2">
      <Label className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-green-600" />
        Other Rewards
      </Label>
      {isEditing ? (
        <Textarea
          value={editedData.rewards_json?.other || ''}
          onChange={(e) => handleRewardChange('other', e.target.value || null)}
          placeholder="e.g., Volo's eternal gratitude, safe passage through the forest"
          rows={2}
        />
      ) : (
        <div className="text-sm">
          {viewModel.quest.rewards_json?.other || (
            <span className="text-muted-foreground">No other rewards</span>
          )}
        </div>
      )}
    </div>
  </div>

  {/* Helper text */}
  <div className="text-xs text-muted-foreground p-3 bg-muted rounded flex items-start gap-2">
    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
    <span>
      💰 These rewards will be given to the party when the quest is marked as completed.
      You can also manually track reward distribution in session notes.
    </span>
  </div>
</div>
```

**Handlers:**
```typescript
const handleRewardChange = useCallback((field: keyof QuestRewards, value: any) => {
  const updated = {
    ...editedData.rewards_json,
    [field]: value,
  };
  onEditedDataChange('rewards_json', updated);
}, [editedData.rewards_json, onEditedDataChange]);
```

**Propsy:**
```typescript
interface RewardsTabProps {
  viewModel: QuestDetailsViewModel;
  isEditing: boolean;
  editedData: EditedQuestData;
  onEditedDataChange: (field: string, value: unknown) => void;
}
```

### 4.10. RelatedTab (tab content)

**Opis:** Czwarty tab - auto-extracted related entities z @mentions + backlinks.

**Content:**
```tsx
<div className="space-y-6">
  {/* Related Entities (auto-extracted from @mentions) */}
  <div className="space-y-3">
    <h3 className="text-lg font-medium">Related Entities</h3>

    {viewModel.relatedEntities.length === 0 ? (
      <div className="text-sm text-muted-foreground p-4 bg-muted rounded">
        No entities mentioned in quest description. Use @mentions to link NPCs, locations, and other entities.
      </div>
    ) : (
      <div className="space-y-4">
        {/* NPCs */}
        {viewModel.relatedNPCs.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">NPCs Involved</Label>
            <div className="flex flex-wrap gap-2">
              {viewModel.relatedNPCs.map(npc => (
                <Button
                  key={npc.id}
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToEntity('npc', npc.id)}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  {npc.name}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Locations */}
        {viewModel.relatedLocations.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Locations</Label>
            <div className="flex flex-wrap gap-2">
              {viewModel.relatedLocations.map(location => (
                <Button
                  key={location.id}
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToEntity('location', location.id)}
                  className="gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  {location.name}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Story Items */}
        {viewModel.relatedStoryItems.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Story Items</Label>
            <div className="flex flex-wrap gap-2">
              {viewModel.relatedStoryItems.map(item => (
                <Button
                  key={item.id}
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToEntity('story_item', item.id)}
                  className="gap-2"
                >
                  <Package className="h-4 w-4" />
                  {item.name}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Other entities */}
        {viewModel.relatedOther.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Other</Label>
            <div className="flex flex-wrap gap-2">
              {viewModel.relatedOther.map(entity => (
                <Button
                  key={entity.id}
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToEntity(entity.entityType, entity.id)}
                  className="gap-2"
                >
                  {entity.name}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>

  <Separator />

  {/* Backlinks ("Mentioned In") */}
  <div className="space-y-3">
    <h3 className="text-lg font-medium">Mentioned In</h3>

    {viewModel.backlinks.length === 0 ? (
      <div className="text-sm text-muted-foreground p-4 bg-muted rounded">
        This quest hasn't been mentioned in any other entities yet.
      </div>
    ) : (
      <div className="space-y-2">
        {viewModel.backlinks.map((backlink, i) => (
          <Button
            key={i}
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-2"
            onClick={() => navigateToEntity(backlink.source_type, backlink.source_id)}
          >
            <div className="flex items-center gap-2 flex-1">
              {/* Icon based on source type */}
              {backlink.source_type === 'npc' && <User className="h-4 w-4" />}
              {backlink.source_type === 'location' && <MapPin className="h-4 w-4" />}
              {backlink.source_type === 'session' && <Calendar className="h-4 w-4" />}
              {backlink.source_type === 'story_arc' && <GitBranch className="h-4 w-4" />}

              {/* Source name + type */}
              <div className="text-left">
                <div className="font-medium">{backlink.source_name}</div>
                <div className="text-xs text-muted-foreground">
                  {backlink.source_type} • {backlink.source_field}
                </div>
              </div>
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>
        ))}
      </div>
    )}
  </div>
</div>
```

**Navigation Handler:**
```typescript
const navigateToEntity = useCallback((entityType: string, entityId: string) => {
  // Navigate based on entity type
  const routes = {
    npc: `/campaigns/${campaignId}/npcs?selectedId=${entityId}`,
    location: `/campaigns/${campaignId}/locations?selectedId=${entityId}`,
    story_item: `/campaigns/${campaignId}/story-items?selectedId=${entityId}`,
    session: `/campaigns/${campaignId}/sessions/${entityId}`,
    story_arc: `/campaigns/${campaignId}/story-arcs?selectedId=${entityId}`,
  };

  const route = routes[entityType];
  if (route) {
    router.push(route);
  }
}, [campaignId]);
```

**Extract Related Entities (client-side):**
```typescript
const relatedEntities = useMemo(() => {
  if (!viewModel.quest.description_json) return [];

  // Extract mentions from Tiptap JSON
  const mentions = extractMentionsFromJson(viewModel.quest.description_json);

  // Fetch entities by IDs (parallel requests)
  // This should be done in useQuestDetailsQuery hook
  return mentions;
}, [viewModel.quest.description_json]);

// Group by type
const relatedNPCs = relatedEntities.filter(e => e.entityType === 'npc');
const relatedLocations = relatedEntities.filter(e => e.entityType === 'location');
const relatedStoryItems = relatedEntities.filter(e => e.entityType === 'story_item');
const relatedOther = relatedEntities.filter(e => !['npc', 'location', 'story_item'].includes(e.entityType));
```

**Propsy:**
```typescript
interface RelatedTabProps {
  viewModel: QuestDetailsViewModel;
  campaignId: string;
  onEntityClick: (entityType: string, entityId: string) => void;
}
```

### 4.11. QuestFormDialog (create/edit dialog)

**Opis:** Modal dialog dla tworzenia i edycji questów (full form). React Hook Form + Zod validation. Używany tylko dla create - edit odbywa się inline w detail panel.

**Structure:**
```tsx
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{mode === 'create' ? 'Create New Quest' : 'Edit Quest'}</DialogTitle>
    </DialogHeader>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Quest title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quest Type */}
        <FormField
          control={form.control}
          name="quest_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quest Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="side">Side Quest</SelectItem>
                  <SelectItem value="main">Main Quest</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quest Giver */}
        <FormField
          control={form.control}
          name="quest_giver_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quest Giver</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'none'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select NPC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {npcs.map(npc => (
                    <SelectItem key={npc.id} value={npc.id}>{npc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Story Arc */}
        <FormField
          control={form.control}
          name="story_arc_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Story Arc</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'none'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select story arc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {storyArcs.map(arc => (
                    <SelectItem key={arc.id} value={arc.id}>{arc.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description_json"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  campaignId={campaignId}
                  editable={true}
                  placeholder="Describe the quest, use @mentions to link entities..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Objectives (dynamic list) */}
        <div className="space-y-3">
          <Label>Objectives</Label>
          {objectiveFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <Checkbox
                checked={form.watch(`objectives_json.${index}.completed`)}
                onCheckedChange={(checked) =>
                  form.setValue(`objectives_json.${index}.completed`, !!checked)
                }
              />
              <Input
                {...form.register(`objectives_json.${index}.text`)}
                placeholder="Objective description"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeObjective(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendObjective({ text: '', completed: false })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Objective
          </Button>
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rewards_json.gold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gold</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rewards_json.xp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Points</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rewards_json.items"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Items (comma-separated)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value?.join(', ') || ''}
                    onChange={(e) => {
                      const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      field.onChange(items.length > 0 ? items : null);
                    }}
                    placeholder="Ring of Protection, +1 Longsword"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rewards_json.other"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Other Rewards</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Free lodging, NPC gratitude..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Quest' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

**Form Schema (Zod):**
```typescript
const questFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').trim(),
  quest_type: z.enum(['main', 'side']),
  quest_giver_id: z.string().uuid().nullable(),
  story_arc_id: z.string().uuid().nullable(),
  description_json: z.any().nullable(),
  objectives_json: z.array(
    z.object({
      text: z.string().min(1, 'Objective text is required'),
      completed: z.boolean(),
    })
  ).nullable(),
  rewards_json: z.object({
    gold: z.number().int().min(0).nullable(),
    xp: z.number().int().min(0).nullable(),
    items: z.array(z.string()).nullable(),
    other: z.string().max(500).nullable(),
  }).nullable(),
  status: z.enum(['not_started', 'active', 'completed', 'failed']),
});
```

**Propsy:**
```typescript
interface QuestFormDialogProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: QuestFormData;
  campaignId: string;
  npcs: Array<{ id: string; name: string }>;
  storyArcs: Array<{ id: string; title: string }>;
  onClose: () => void;
  onSubmit: (data: CreateQuestCommand | UpdateQuestCommand) => Promise<void>;
}
```

## 5. Typy

### 5.1. Entity Types (database + DTO)

```typescript
// Raw database type
export type Quest = Tables<'quests'>;

// DTO with typed JSON fields
export interface QuestDTO extends Omit<Quest, 'description_json' | 'objectives_json' | 'rewards_json'> {
  id: string;
  campaign_id: string;
  story_arc_id: string | null;
  quest_giver_id: string | null; // NEW FIELD
  quest_type: 'main' | 'side'; // NEW FIELD
  title: string;
  description_json: JSONContent | null; // Tiptap typed
  objectives_json: QuestObjective[] | null; // Parsed array
  rewards_json: QuestRewards | null; // Parsed object
  status: 'not_started' | 'active' | 'completed' | 'failed';
  notes: string | null; // NEW FIELD (optional DM notes)
  start_date: string | null; // NEW FIELD (in-game date)
  deadline: string | null; // NEW FIELD (in-game date)
  created_at: string;
  updated_at: string;
}

// Objective structure
export interface QuestObjective {
  id: string; // NEW: unique ID for reordering (future)
  text: string;
  completed: boolean;
  notes?: string; // NEW: optional notes per objective
}

// Rewards structure
export interface QuestRewards {
  gold?: number | null;
  items?: string[] | null;
  xp?: number | null;
  other?: string | null;
}
```

### 5.2. View Models

```typescript
// For list view (left panel)
export interface QuestCardViewModel {
  quest: QuestDTO;
  objectivesProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  rewardsSummary: string; // "500 gold, Ring, 1000 XP"
  questGiverName: string | null; // joined from npcs table
  storyArcName: string | null; // joined from story_arcs table
}

// For detail view (right panel)
export interface QuestDetailsViewModel {
  quest: QuestDTO;
  objectivesProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  questGiverName: string | null;
  storyArcName: string | null;
  relatedEntities: RelatedEntity[]; // extracted from @mentions
  relatedNPCs: RelatedEntity[]; // filtered by type
  relatedLocations: RelatedEntity[];
  relatedStoryItems: RelatedEntity[];
  relatedOther: RelatedEntity[];
  backlinks: BacklinkItem[]; // where quest is @mentioned
}

// Related entity (from @mentions)
export interface RelatedEntity {
  id: string;
  name: string;
  entityType: 'npc' | 'location' | 'faction' | 'story_item' | 'story_arc';
}

// Backlink item
export interface BacklinkItem {
  source_type: 'npc' | 'quest' | 'session' | 'location' | 'faction' | 'story_arc' | 'lore_note';
  source_id: string;
  source_name: string;
  source_field: string; // e.g., "description_json"
}
```

### 5.3. Command Models

```typescript
// Create quest
export interface CreateQuestCommand {
  title: string; // required
  quest_type?: 'main' | 'side'; // default 'side'
  quest_giver_id?: string | null;
  story_arc_id?: string | null;
  description_json?: JSONContent | null;
  objectives_json?: QuestObjective[] | null;
  rewards_json?: QuestRewards | null;
  status?: 'not_started' | 'active' | 'completed' | 'failed'; // default 'not_started'
  notes?: string | null;
  start_date?: string | null;
  deadline?: string | null;
}

// Update quest (partial)
export interface UpdateQuestCommand {
  title?: string;
  quest_type?: 'main' | 'side';
  quest_giver_id?: string | null;
  story_arc_id?: string | null;
  description_json?: JSONContent | null;
  objectives_json?: QuestObjective[] | null;
  rewards_json?: QuestRewards | null;
  status?: 'not_started' | 'active' | 'completed' | 'failed';
  notes?: string | null;
  start_date?: string | null;
  deadline?: string | null;
}
```

### 5.4. Filter Types

```typescript
export interface QuestFilters {
  status?: 'not_started' | 'active' | 'completed' | 'failed';
  quest_type?: 'main' | 'side';
  story_arc_id?: string; // specific arc ID
  quest_giver_id?: string; // specific NPC ID (future filter)
}
```

### 5.5. Form Data Types

```typescript
// React Hook Form type
export interface QuestFormData {
  title: string;
  quest_type: 'main' | 'side';
  quest_giver_id: string | null;
  story_arc_id: string | null;
  description_json: JSONContent | null;
  objectives_json: QuestObjective[] | null;
  rewards_json: QuestRewards | null;
  status: 'not_started' | 'active' | 'completed' | 'failed';
  notes: string | null;
  start_date: string | null;
  deadline: string | null;
}

// Edited data (for edit mode in detail panel)
export interface EditedQuestData {
  title: string;
  quest_type: 'main' | 'side';
  quest_giver_id: string | null;
  story_arc_id: string | null;
  description_json: JSONContent | null;
  objectives_json: QuestObjective[] | null;
  rewards_json: QuestRewards | null;
  status: 'not_started' | 'active' | 'completed' | 'failed';
  notes: string | null;
  start_date: string | null;
  deadline: string | null;
}
```

## 6. Zarządzanie stanem

### 6.1. Server State - React Query

**Custom Hooks (`src/hooks/useQuests.ts`):**

```typescript
// Query: fetch all quests with filters
export function useQuestsQuery(campaignId: string, filters?: QuestFilters) {
  return useQuery({
    queryKey: ['quests', campaignId, filters],
    queryFn: () => getQuests(campaignId, filters),
    enabled: !!campaignId,
  });
}

// Query: fetch single quest with related data
export function useQuestDetailsQuery(questId: string | null) {
  return useQuery({
    queryKey: ['quest', questId, 'details'],
    queryFn: async () => {
      if (!questId) return null;

      const quest = await getQuest(questId);

      // Extract related entities from @mentions (client-side)
      const mentions = extractMentionsFromJson(quest.description_json);
      const relatedEntities = await fetchEntitiesByIds(mentions);

      // Fetch backlinks
      const backlinks = await getMentionsOf('quest', questId);

      return {
        quest,
        relatedEntities,
        backlinks,
      };
    },
    enabled: !!questId,
  });
}

// Mutation: create quest
export function useCreateQuestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, command }: { campaignId: string; command: CreateQuestCommand }) =>
      createQuest(campaignId, command),
    onSuccess: (newQuest, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['quests', campaignId] });
      toast.success('Quest created successfully');
    },
    onError: () => {
      toast.error('Failed to create quest');
    },
  });
}

// Mutation: update quest
export function useUpdateQuestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questId, command }: { questId: string; command: UpdateQuestCommand }) =>
      updateQuest(questId, command),
    onSuccess: (updatedQuest) => {
      queryClient.invalidateQueries({ queryKey: ['quests', updatedQuest.campaign_id] });
      queryClient.invalidateQueries({ queryKey: ['quest', updatedQuest.id] });
      toast.success('Quest updated');
    },
    onError: () => {
      toast.error('Failed to update quest');
    },
  });
}

// Mutation: delete quest
export function useDeleteQuestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questId: string) => deleteQuest(questId),
    onSuccess: (_, questId) => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      toast.success('Quest deleted');
    },
    onError: () => {
      toast.error('Failed to delete quest');
    },
  });
}
```

### 6.2. Local State - React useState

**W komponencie QuestsView (page.tsx):**

```typescript
const [selectedQuestId, setSelectedQuestId] = useState<string | null>(
  searchParams.get('selectedId') || null
);
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [filters, setFilters] = useState<QuestFilters>({});
const [isEditing, setIsEditing] = useState(false);
const [editedData, setEditedData] = useState<EditedQuestData | null>(null);
```

**W QuestsList:**

```typescript
const [localSearch, setLocalSearch] = useState('');
const [sortBy, setSortBy] = useState<SortOption>('recent');
```

**W QuestDetailPanel:**

```typescript
const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
```

### 6.3. Form State - React Hook Form

```typescript
const form = useForm<QuestFormData>({
  resolver: zodResolver(questFormSchema),
  defaultValues: {
    title: '',
    quest_type: 'side',
    quest_giver_id: null,
    story_arc_id: null,
    description_json: null,
    objectives_json: [],
    rewards_json: {
      gold: null,
      items: null,
      xp: null,
      other: null,
    },
    status: 'not_started',
    notes: null,
    start_date: null,
    deadline: null,
  },
});
```

## 7. Integracja API

### 7.1. API Functions (`src/lib/api/quests.ts`)

**WAŻNE: Dodać mentions pattern do create/update!**

```typescript
/**
 * GET - Fetch all quests for campaign
 * Filters: status, quest_type, story_arc_id
 * Joins: quest_giver (npcs), story_arc
 */
export async function getQuests(
  campaignId: string,
  filters?: QuestFilters
): Promise<QuestDTO[]> {
  let query = supabase
    .from('quests')
    .select(`
      *,
      quest_giver:quest_giver_id(id, name),
      story_arc:story_arc_id(id, title)
    `)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.quest_type) {
    query = query.eq('quest_type', filters.quest_type);
  }
  if (filters?.story_arc_id) {
    query = query.eq('story_arc_id', filters.story_arc_id);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Map to DTO
  return data.map(rawQuest => ({
    ...rawQuest,
    description_json: parseQuestDescription(rawQuest.description_json),
    objectives_json: parseQuestObjectives(rawQuest.objectives_json),
    rewards_json: parseQuestRewards(rawQuest.rewards_json),
  }));
}

/**
 * GET - Fetch single quest by ID
 */
export async function getQuest(questId: string): Promise<QuestDTO> {
  const { data, error } = await supabase
    .from('quests')
    .select(`
      *,
      quest_giver:quest_giver_id(id, name),
      story_arc:story_arc_id(id, title)
    `)
    .eq('id', questId)
    .single();

  if (error) throw error;

  return {
    ...data,
    description_json: parseQuestDescription(data.description_json),
    objectives_json: parseQuestObjectives(data.objectives_json),
    rewards_json: parseQuestRewards(data.rewards_json),
  };
}

/**
 * POST - Create new quest
 * INCLUDES mentions pattern (extract + batch create)
 */
export async function createQuest(
  campaignId: string,
  command: CreateQuestCommand
): Promise<QuestDTO> {
  const { data, error } = await supabase
    .from('quests')
    .insert({
      campaign_id: campaignId,
      ...command,
      quest_type: command.quest_type || 'side',
      status: command.status || 'not_started',
    })
    .select()
    .single();

  if (error) throw error;

  // Extract mentions from description_json and create entity_mentions
  try {
    const mentions = extractMentionsFromJson(command.description_json);
    if (mentions.length > 0) {
      await batchCreateEntityMentions(
        campaignId,
        mentions.map(m => ({
          source_type: 'quest',
          source_id: data.id,
          source_field: 'description_json',
          mentioned_type: m.entityType,
          mentioned_id: m.id,
        }))
      );
    }
  } catch (mentionError) {
    // Non-blocking, log error but don't fail quest creation
    console.error('Failed to create entity mentions:', mentionError);
  }

  return {
    ...data,
    description_json: parseQuestDescription(data.description_json),
    objectives_json: parseQuestObjectives(data.objectives_json),
    rewards_json: parseQuestRewards(data.rewards_json),
  };
}

/**
 * PATCH - Update quest (partial update)
 * INCLUDES mentions pattern (delete old + extract + batch create)
 */
export async function updateQuest(
  questId: string,
  command: UpdateQuestCommand
): Promise<QuestDTO> {
  const { data, error } = await supabase
    .from('quests')
    .update(command)
    .eq('id', questId)
    .select()
    .single();

  if (error) throw error;

  // If description_json updated, sync mentions
  if (command.description_json !== undefined) {
    try {
      // Delete old mentions for description_json field
      await deleteMentionsBySource('quest', questId, 'description_json');

      // Extract and create new mentions
      const mentions = extractMentionsFromJson(command.description_json);
      if (mentions.length > 0) {
        await batchCreateEntityMentions(
          data.campaign_id,
          mentions.map(m => ({
            source_type: 'quest',
            source_id: questId,
            source_field: 'description_json',
            mentioned_type: m.entityType,
            mentioned_id: m.id,
          }))
        );
      }
    } catch (mentionError) {
      console.error('Failed to sync entity mentions:', mentionError);
    }
  }

  return {
    ...data,
    description_json: parseQuestDescription(data.description_json),
    objectives_json: parseQuestObjectives(data.objectives_json),
    rewards_json: parseQuestRewards(data.rewards_json),
  };
}

/**
 * DELETE - Delete quest
 * Cascade deletes entity_mentions (ON DELETE CASCADE)
 */
export async function deleteQuest(questId: string): Promise<void> {
  const { error } = await supabase
    .from('quests')
    .delete()
    .eq('id', questId);

  if (error) throw error;
}
```

### 7.2. Helper Functions

```typescript
// Parse objectives_json from DB (Json type → QuestObjective[])
function parseQuestObjectives(json: Json | null): QuestObjective[] | null {
  if (!json) return null;
  if (!Array.isArray(json)) return null;

  return json.map((obj: any) => ({
    id: obj.id || crypto.randomUUID(), // generate ID if missing
    text: obj.text,
    completed: obj.completed || false,
    notes: obj.notes || undefined,
  }));
}

// Parse rewards_json from DB (Json type → QuestRewards)
function parseQuestRewards(json: Json | null): QuestRewards | null {
  if (!json || typeof json !== 'object') return null;

  return {
    gold: (json as any).gold || null,
    items: (json as any).items || null,
    xp: (json as any).xp || null,
    other: (json as any).other || null,
  };
}

// Parse description_json from DB (Json type → JSONContent)
function parseQuestDescription(json: Json | null): JSONContent | null {
  if (!json) return null;
  return json as JSONContent;
}

// Calculate objectives progress
export function calculateObjectivesProgress(objectives: QuestObjective[] | null): {
  completed: number;
  total: number;
  percentage: number;
} {
  if (!objectives || objectives.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const total = objectives.length;
  const completed = objectives.filter(o => o.completed).length;
  const percentage = Math.round((completed / total) * 100);

  return { completed, total, percentage };
}

// Format rewards summary for list view
export function formatRewardsSummary(rewards: QuestRewards | null): string {
  if (!rewards) return 'No rewards';

  const parts: string[] = [];
  if (rewards.gold) parts.push(`${rewards.gold} gold`);
  if (rewards.items && rewards.items.length > 0) {
    parts.push(rewards.items.slice(0, 2).join(', '));
    if (rewards.items.length > 2) parts.push(`+${rewards.items.length - 2} more`);
  }
  if (rewards.xp) parts.push(`${rewards.xp} XP`);

  return parts.length > 0 ? parts.join(', ') : 'No rewards';
}
```

### 7.3. Backlinks API (`src/lib/api/entity-mentions.ts`)

Wykorzystujemy istniejące API:

```typescript
// Fetch backlinks (where quest is @mentioned)
const backlinks = await getMentionsOf('quest', questId);

// Returns BacklinkItem[] with source_type, source_id, source_name, source_field
```

## 8. Kroki implementacji

### Phase 0: Database Migration

**Create:** `supabase/migrations/[timestamp]_add_quest_fields.sql`

```sql
-- Add quest_giver_id and quest_type columns
ALTER TABLE quests
  ADD COLUMN quest_giver_id uuid REFERENCES npcs(id) ON DELETE SET NULL,
  ADD COLUMN quest_type text NOT NULL DEFAULT 'side',
  ADD COLUMN notes text,
  ADD COLUMN start_date text,
  ADD COLUMN deadline text,
  ADD CONSTRAINT quests_quest_type_check CHECK (quest_type IN ('main', 'side'));

-- Add indexes
CREATE INDEX idx_quests_giver_id ON quests(quest_giver_id) WHERE quest_giver_id IS NOT NULL;
CREATE INDEX idx_quests_type ON quests(quest_type);

-- Update RLS policies (if needed - existing policies should work)
```

**Run migration:**
```bash
npx supabase db push
```

### Phase 1: Update Types & API

**1.1. Update:** `src/types/quests.ts`
- Add `quest_giver_id: string | null` to QuestDTO
- Add `quest_type: 'main' | 'side'` to QuestDTO
- Add `notes: string | null` to QuestDTO
- Add `start_date: string | null` to QuestDTO
- Add `deadline: string | null` to QuestDTO
- Add `questGiverName: string | null` to QuestCardViewModel
- Update QuestObjective with `id: string` and `notes?: string`

**1.2. Update:** `src/lib/api/quests.ts`
- Import: `extractMentionsFromJson`, `batchCreateEntityMentions`, `deleteMentionsBySource`
- Update `getQuests()`: add `.select()` join for quest_giver
- Update `createQuest()`: add mentions pattern (extract + batch create) after insert
- Update `updateQuest()`: add mentions pattern (delete old + extract + batch create) if description_json changed
- Add helper functions: `parseQuestObjectives()`, `parseQuestRewards()`, `calculateObjectivesProgress()`, `formatRewardsSummary()`

**1.3. Create:** `src/lib/schemas/quests.ts`
- `questFormSchema` (Zod) for QuestFormDialog validation
- Include all new fields (quest_type, quest_giver_id, notes, dates)

### Phase 2: React Query Hooks

**2.1. Create:** `src/hooks/useQuests.ts`
- `useQuestsQuery(campaignId, filters?)` - fetch with status/quest_type/story_arc_id filters
- `useQuestDetailsQuery(questId)` - fetch single quest + extract related entities client-side
- `useCreateQuestMutation()` - with optimistic update
- `useUpdateQuestMutation()` - for inline edits and full save
- `useDeleteQuestMutation()` - with cleanup

**2.2. Verify:** `src/hooks/useStoryArcs.ts` exists (for story arc select/filter)
**2.3. Verify:** `src/hooks/useNPCs.ts` exists (for quest_giver select)

### Phase 3: Shared Components

**3.1. Verify:** `src/components/shared/RichTextEditor.tsx` exists with @mentions support
**3.2. Create:** `src/components/quests/StatusBadge.tsx` (color map: active/not_started/completed/failed)
**3.3. Create:** `src/components/quests/QuestTypeBadge.tsx` (MAIN emerald / SIDE gray)

### Phase 4: Left Panel Components (30%)

**4.1. Create:** `src/components/quests/QuestListItem.tsx`
- Button with selection state styling (`border-l-4 border-primary` when selected)
- Status dot, quest type badge, title, progress bar, story arc badge, rewards icons
- Props: `{ quest: QuestCardViewModel, isSelected: boolean, onClick }`

**4.2. Create:** `src/components/quests/QuestsFiltersCompact.tsx`
- Popover with 3 filter groups: Status (RadioGroup), Quest Type (RadioGroup), Story Arc (Select)
- Active filter chips with remove buttons
- "Clear all filters" button
- Active filter count badge on trigger button

**4.3. Create:** `src/components/quests/QuestsList.tsx`
- Structure: Search → Sort → Filters → Scrollable list → Footer stats
- Client-side search (fuzzy, title + description)
- Sort options: Recent/Name A-Z/Name Z-A/Priority/Progress
- Empty state + loading skeleton (5 items)
- Props: `{ quests, selectedQuestId, onQuestSelect, filters, onFiltersChange, npcs, storyArcs, isLoading }`

### Phase 5: Right Panel - Tab Components (70%)

**5.1. Create:** `src/components/quests/tabs/DetailsTab.tsx`
- RichTextEditor for description (@mentions, edit toggle)
- Quest Giver select (NPCs dropdown, editable in edit mode)
- Key Locations (read-only, extracted from @mentions)
- Notes & Clues (textarea, editable in edit mode)
- Dates (start/deadline, text inputs, editable in edit mode)

**5.2. Create:** `src/components/quests/tabs/ObjectivesTab.tsx`
- Progress summary header
- ObjectiveItem[] with checkbox toggle, inline text edit, delete button
- "+ Add Objective" button
- Auto-save on toggle/text change/delete
- Helper text about manual quest completion

**5.3. Create:** `src/components/quests/tabs/RewardsTab.tsx`
- 2x2 grid: Gold (number) | XP (number) | Items (textarea) | Other (textarea)
- Icons for each reward type (Coins/Sparkles/Package/Gift)
- Auto-save on blur (in non-edit mode)
- Helper text about reward distribution

**5.4. Create:** `src/components/quests/tabs/RelatedTab.tsx`
- Related Entities section: auto-extracted from @mentions, grouped by type (NPCs/Locations/Items/Other)
- EntityLink buttons with icons and external link indicator
- Backlinks section: fetch via `getMentionsOf('quest', questId)`
- BacklinkItem buttons with source type icon, name, field

### Phase 6: Right Panel - Detail Panel Container

**6.1. Create:** `src/components/quests/QuestDetailPanel.tsx`
- 4 states: Empty (no selection) | Loading (skeleton) | 404 (not found) | Content
- Header with title (inline editable), quest type badge, status badge, story arc select, progress bar, action buttons
- Edit mode styling: `border-2 border-primary/30 bg-primary/5 m-1`
- Tabs container (Shadcn Tabs) with 4 tabs: Details | Objectives | Rewards | Related
- Delete confirmation AlertDialog
- Props: `{ questId, viewModel, campaignId, npcs, storyArcs, isLoading, isEditing, editedData, onEdit, onSave, onCancelEdit, onDelete, onEditedDataChange, isUpdating, isDeleting }`

### Phase 7: Layout & Orchestration

**7.1. Create:** `src/components/quests/QuestsLayout.tsx`
- Split view container: `flex gap-6 overflow-hidden`
- Left panel: `w-[30%] border-r` → QuestsList
- Right panel: `flex-1` → QuestDetailPanel
- Props: Combine props from both children (like NPCsLayout)

**7.2. Create:** `src/components/quests/QuestsHeader.tsx`
- Breadcrumb (fetch campaign name via `useCampaignQuery`)
- H1: "Quests"
- Button: "+ New Quest" → trigger `setIsCreateDialogOpen(true)`

**7.3. Create:** `src/app/(dashboard)/campaigns/[id]/quests/page.tsx`
- Extract campaignId from params
- State management: selectedQuestId (URL sync), isCreateDialogOpen, filters, isEditing, editedData
- URL synchronization with `useEffect` + `router.push` (scroll: false)
- Reset edit mode on selection change
- Queries: quests (with filters), questDetails (if selected), npcs, storyArcs
- Mutations: create, update, delete
- Data transformation: map quests → QuestCardViewModel with progress + rewards summary
- Save handler: compare editedData vs viewModel, extract changed fields only
- Render: QuestsHeader + QuestsLayout + QuestFormDialog (conditional)

### Phase 8: Quest Form Dialog

**8.1. Create:** `src/components/quests/QuestFormDialog.tsx`
- Modal dialog (Shadcn Dialog) for create (NOT for edit - edit is inline)
- React Hook Form + zodResolver(questFormSchema)
- Fields: title*, quest_type, quest_giver_id, story_arc_id, description (RichTextEditor), objectives (useFieldArray), rewards (2x2 grid), status
- Dynamic objectives list with "+ Add" and delete buttons
- Submit handler: call create mutation
- Pre-fill for edit mode (if ever used, though edit is inline)
- Props: `{ isOpen, mode, initialData?, campaignId, npcs, storyArcs, onClose, onSubmit }`

### Phase 9: Helper Functions & Utils

**9.1. Add to utils:**
- `calculateObjectivesProgress(objectives)` → `{ completed, total, percentage }`
- `formatRewardsSummary(rewards)` → "500g, Ring, 1000 XP"
- `parseQuestObjectives(json)` → QuestObjective[]
- `parseQuestRewards(json)` → QuestRewards
- `parseQuestDescription(json)` → JSONContent

### Phase 10: Testing & Polish

**10.1. Test flows:**
- Create quest (form → optimistic update → detail panel)
- Update quest inline (title, status, story arc, description, objectives, rewards)
- Delete quest (confirm → remove from list)
- Filters (status, quest_type, story_arc)
- Search & sort (client-side)
- URL sync (selectedQuestId in query params)
- @mentions extraction (related entities, backlinks)

**10.2. Verify:**
- Toast notifications on success/error
- Loading states (skeleton, spinners)
- Empty states (no quests, no objectives, no related entities)
- Accessibility (keyboard nav, ARIA labels, focus management)
- Responsive (split view min-width check, stack on very small screens if needed)

**10.3. Edge cases:**
- Quest with 0 objectives (progress 0/0, 0%)
- Quest with no rewards (display "No rewards")
- Quest with no quest giver (display "None")
- Quest with no story arc (display "None")
- Concurrent edit (two tabs, optimistic update conflicts)

### Phase 11: Documentation & Cleanup

**11.1. Update README/docs:**
- Add Quests view to feature list
- Document quest_type field (main/side)
- Document quest_giver_id field (optional NPC FK)

**11.2. Code cleanup:**
- Remove unused imports
- Add JSDoc comments to components
- Verify TypeScript strict mode compliance
- Run linter (`npm run lint`)

---

## 9. Kluczowe różnice vs oryginalny plan (Grid + Slideover)

| Aspekt | Oryginalny Plan (Grid + Slideover) | Nowy Plan (Split View) |
|--------|-------------------------------------|------------------------|
| **Layout** | Grid 2-col + Slideover 700px | Split 30/70 (persistent panels) |
| **Edit Mode** | Full form dialog (QuestFormDialog) | Inline editing w detail panel + edit mode toggle |
| **Selection** | Click card → open slideover | Click list item → show in detail panel (persistent) |
| **URL Sync** | Brak | selectedQuestId w query params |
| **Quest Type** | Brak | quest_type field (main/side) z visual badges |
| **Quest Giver** | Brak dedykowanego pola | quest_giver_id FK do npcs |
| **Detail Tabs** | Wszystko w jednym scrollu | 4 taby (Details \| Objectives \| Rewards \| Related) |
| **Context Switching** | Otwarcie/zamknięcie slideover | Instant click (persistent detail) |
| **Screen Usage** | Slideover zakrywa grid | Both panels visible simultaneously |
| **Session UX** | Częste otwieranie/zamykanie | Quick reference podczas sesji (lepsze) |

---

## 10. Pytania bez odpowiedzi (TODO)

- Czy objectives mają mieć pole `order` dla przyszłego drag & drop reordering? (Obecnie: stała kolejność array)
- Czy dodać pole `priority` do questów (high/medium/low)? (Obecnie: tylko quest_type main/side)
- Czy quest może mieć multiple quest givers? (Obecnie: tylko jeden quest_giver_id)
- Czy dodać pole `experience_level` dla sugerowanego poziomu party? (Obecnie: brak)
- Czy dodać automatic quest completion trigger gdy wszystkie objectives completed? (Obecnie: manual)

---

**Koniec planu implementacji Quests View (Split Layout Pattern)**
