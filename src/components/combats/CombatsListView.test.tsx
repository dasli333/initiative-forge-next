import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils/test-utils";
import { CombatsListView } from "./CombatsListView";
import { mockPush } from "@/test/mocks/next-router";
import { createMockCombat, createMockCombatsList, createMockCombatsArray } from "@/test/factories/combat.factory";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import type { ListCombatsResponseDTO } from "@/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock React Query hooks - these are the actual hooks used by CombatsListView
vi.mock("@/hooks/useCombats");

// Mock child components to isolate unit tests
vi.mock("./CombatsHeader", () => ({
  CombatsHeader: ({ onCreateNew }: { onCreateNew: () => void }) => (
    <div data-testid="combats-header">
      <button onClick={onCreateNew} data-testid="create-new-button">
        Create New Combat
      </button>
    </div>
  ),
}));

vi.mock("./CombatsGrid", () => ({
  CombatsGrid: ({ combats, onResume, onView, onDelete }: any) => (
    <div data-testid="combats-grid">
      {combats.map((combat: any) => (
        <div key={combat.id} data-testid={`combat-card-${combat.id}`}>
          <span>{combat.name}</span>
          <button onClick={() => onResume(combat)} data-testid={`resume-${combat.id}`}>
            Resume
          </button>
          <button onClick={() => onView(combat)} data-testid={`view-${combat.id}`}>
            View
          </button>
          <button onClick={() => onDelete(combat)} data-testid={`delete-${combat.id}`}>
            Delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("./EmptyState", () => ({
  EmptyState: ({ onCreateNew }: { onCreateNew: () => void }) => (
    <div data-testid="empty-state">
      <button onClick={onCreateNew} data-testid="empty-create-button">
        Create First Combat
      </button>
    </div>
  ),
}));

vi.mock("./DeleteConfirmationDialog", () => ({
  DeleteConfirmationDialog: ({ isOpen, combatName, onConfirm, onCancel, isDeleting }: any) =>
    isOpen ? (
      <div data-testid="delete-dialog">
        <span data-testid="delete-dialog-name">{combatName}</span>
        <button onClick={onConfirm} disabled={isDeleting} data-testid="confirm-delete-button">
          Confirm Delete
        </button>
        <button onClick={onCancel} data-testid="cancel-delete-button">
          Cancel
        </button>
      </div>
    ) : null,
}));

describe("CombatsListView", () => {
  const mockCampaignId = "campaign-456";
  const mockCampaignName = "Test Campaign";

  // Mock implementations
  let mockUseCombatsQuery: ReturnType<typeof vi.fn>;
  let mockUseDeleteCombatMutation: ReturnType<typeof vi.fn>;
  let mockMutate: ReturnType<typeof vi.fn>;
  let mockRefetch: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Reset mocks
    mockPush.mockClear();
    mockMutate = vi.fn();
    mockRefetch = vi.fn();

    // Setup default mock implementations
    mockUseCombatsQuery = vi.fn();
    mockUseDeleteCombatMutation = vi.fn();

    // Import and setup mocks dynamically
    const useCombatsModule = await import("@/hooks/useCombats");

    vi.mocked(useCombatsModule.useCombatsQuery).mockImplementation(mockUseCombatsQuery);
    vi.mocked(useCombatsModule.useDeleteCombatMutation).mockImplementation(mockUseDeleteCombatMutation);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // CONDITIONAL RENDERING TESTS
  // ============================================================================

  describe("Conditional Rendering", () => {
    it("should render skeleton loader when loading", () => {
      mockUseCombatsQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      const { container } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      // Check for skeleton elements
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(screen.queryByTestId("combats-grid")).not.toBeInTheDocument();
      expect(screen.queryByTestId("error-state")).not.toBeInTheDocument();
      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    });

    it("should render error state when error occurs", () => {
      mockUseCombatsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      // Check for error state content
      expect(screen.getByText("Failed to load combats")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
      expect(screen.queryByTestId("combats-grid")).not.toBeInTheDocument();
      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    });

    it("should render empty state when no combats exist", () => {
      const emptyData = createMockCombatsList([]);

      mockUseCombatsQuery.mockReturnValue({
        data: emptyData,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.queryByTestId("combats-grid")).not.toBeInTheDocument();
      expect(screen.queryByTestId("skeleton-loader")).not.toBeInTheDocument();
      expect(screen.queryByTestId("error-state")).not.toBeInTheDocument();
    });

    it("should render combats grid when data exists", () => {
      const combats = createMockCombatsArray(3);
      const data = createMockCombatsList(combats);

      mockUseCombatsQuery.mockReturnValue({
        data,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      expect(screen.getByTestId("combats-grid")).toBeInTheDocument();
      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
      expect(screen.queryByTestId("skeleton-loader")).not.toBeInTheDocument();
      expect(screen.queryByTestId("error-state")).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // NAVIGATION EVENT HANDLERS TESTS
  // ============================================================================

  describe("Navigation Event Handlers", () => {
    beforeEach(() => {
      const combats = createMockCombatsArray(2);
      const data = createMockCombatsList(combats);

      mockUseCombatsQuery.mockReturnValue({
        data,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);
    });

    it("should navigate to create combat page when handleCreateNew is called", async () => {
      const { user } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      const createButton = screen.getByTestId("create-new-button");
      await user.click(createButton);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(`/campaigns/${mockCampaignId}/combats/new`);
    });

    it("should navigate to combat page when handleResume is called", async () => {
      const { user } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      const resumeButton = screen.getByTestId("resume-combat-1");
      await user.click(resumeButton);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(`/combats/combat-1?campaignId=${mockCampaignId}`);
    });

    it("should navigate to combat page when handleView is called", async () => {
      const { user } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      const viewButton = screen.getByTestId("view-combat-1");
      await user.click(viewButton);

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(`/combats/combat-1?campaignId=${mockCampaignId}`);
    });

    it("should call navigate with different combat IDs for different combats", async () => {
      const { user } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      const resumeButton1 = screen.getByTestId("resume-combat-1");
      const resumeButton2 = screen.getByTestId("resume-combat-2");

      await user.click(resumeButton1);
      expect(mockPush).toHaveBeenLastCalledWith(`/combats/combat-1?campaignId=${mockCampaignId}`);

      await user.click(resumeButton2);
      expect(mockPush).toHaveBeenLastCalledWith(`/combats/combat-2?campaignId=${mockCampaignId}`);

      expect(mockPush).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================================
  // DELETE FLOW EVENT HANDLERS TESTS
  // ============================================================================

  describe("Delete Flow Event Handlers", () => {
    beforeEach(() => {
      const combat = createMockCombat({ id: "combat-to-delete", name: "Test Combat" });
      const data = createMockCombatsList([combat]);

      mockUseCombatsQuery.mockReturnValue({
        data,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);
    });

    it("should open delete dialog when handleDeleteClick is called", async () => {
      const { user } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      // Dialog should not be visible initially
      expect(screen.queryByTestId("delete-dialog")).not.toBeInTheDocument();

      // Click delete button
      const deleteButton = screen.getByTestId("delete-combat-to-delete");
      await user.click(deleteButton);

      // Dialog should now be visible
      expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
      expect(screen.getByTestId("delete-dialog-name")).toHaveTextContent("Test Combat");
    });

    it("should call deleteMutation.mutate when handleDeleteConfirm is called", async () => {
      const { user } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      // Open dialog
      const deleteButton = screen.getByTestId("delete-combat-to-delete");
      await user.click(deleteButton);

      // Mock mutate to call onSuccess callback
      mockMutate.mockImplementation((id, options) => {
        if (options?.onSuccess) {
          options.onSuccess();
        }
      });

      // Confirm delete
      const confirmButton = screen.getByTestId("confirm-delete-button");
      await user.click(confirmButton);

      // Verify mutate was called with correct ID
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith("combat-to-delete", expect.any(Object));

      // Dialog should close after successful deletion
      await waitFor(() => {
        expect(screen.queryByTestId("delete-dialog")).not.toBeInTheDocument();
      });
    });

    it("should close dialog and clear state when handleDeleteCancel is called", async () => {
      const { user } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      // Open dialog
      const deleteButton = screen.getByTestId("delete-combat-to-delete");
      await user.click(deleteButton);

      expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();

      // Cancel delete
      const cancelButton = screen.getByTestId("cancel-delete-button");
      await user.click(cancelButton);

      // Dialog should be closed
      expect(screen.queryByTestId("delete-dialog")).not.toBeInTheDocument();

      // Mutate should not have been called
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should not call mutate if combatToDelete is null", async () => {
      const { user } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      // Try to confirm without opening dialog first (edge case)
      // This shouldn't happen in normal flow, but tests boundary condition
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should show loading state in dialog when deletion is pending", async () => {
      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      } as Partial<UseMutationResult>);

      const { user } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      // Open dialog
      const deleteButton = screen.getByTestId("delete-combat-to-delete");
      await user.click(deleteButton);

      // Confirm button should be disabled during deletion
      const confirmButton = screen.getByTestId("confirm-delete-button");
      expect(confirmButton).toBeDisabled();
    });
  });

  // ============================================================================
  // PROPS PASSING TESTS
  // ============================================================================

  describe("Props Passing to Child Components", () => {
    it("should pass correct props to CombatsHeader", () => {
      const combats = createMockCombatsArray(1);
      const data = createMockCombatsList(combats);

      mockUseCombatsQuery.mockReturnValue({
        data,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      // Header should be rendered
      expect(screen.getByTestId("combats-header")).toBeInTheDocument();
    });

    it("should pass correct combats array to CombatsGrid", () => {
      const combats = createMockCombatsArray(3);
      const data = createMockCombatsList(combats);

      mockUseCombatsQuery.mockReturnValue({
        data,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      // Should render all 3 combats
      expect(screen.getByTestId("combat-card-combat-1")).toBeInTheDocument();
      expect(screen.getByTestId("combat-card-combat-2")).toBeInTheDocument();
      expect(screen.getByTestId("combat-card-combat-3")).toBeInTheDocument();
    });

    it("should pass refetch function to ErrorState", async () => {
      mockUseCombatsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      const { user } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      const retryButton = screen.getByRole("button", { name: /try again/i });
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("should pass correct combat name to DeleteConfirmationDialog", async () => {
      const combat = createMockCombat({ id: "combat-123", name: "Dragon Battle" });
      const data = createMockCombatsList([combat]);

      mockUseCombatsQuery.mockReturnValue({
        data,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      const { user } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      const deleteButton = screen.getByTestId("delete-combat-123");
      await user.click(deleteButton);

      expect(screen.getByTestId("delete-dialog-name")).toHaveTextContent("Dragon Battle");
    });

    it("should pass empty string to DeleteConfirmationDialog when combatToDelete is null", () => {
      const combats = createMockCombatsArray(1);
      const data = createMockCombatsList(combats);

      mockUseCombatsQuery.mockReturnValue({
        data,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

      // Dialog is closed, so it shouldn't be rendered
      expect(screen.queryByTestId("delete-dialog")).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // EDGE CASES & BUSINESS RULES
  // ============================================================================

  describe("Edge Cases and Business Rules", () => {
    it("should handle campaignId in all navigation calls", async () => {
      const combats = createMockCombatsArray(1);
      const data = createMockCombatsList(combats);

      mockUseCombatsQuery.mockReturnValue({
        data,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      const customCampaignId = "custom-campaign-789";
      const { user } = render(<CombatsListView campaignId={customCampaignId} campaignName="Custom Campaign" />);

      const createButton = screen.getByTestId("create-new-button");
      await user.click(createButton);

      expect(mockPush).toHaveBeenCalledWith(`/campaigns/${customCampaignId}/combats/new`);
    });

    it("should call useCombatsList with correct campaignId", () => {
      mockUseCombatsQuery.mockReturnValue({
        data: createMockCombatsList([]),
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      const testCampaignId = "test-campaign-999";
      render(<CombatsListView campaignId={testCampaignId} campaignName="Test" />);

      expect(mockUseCombatsQuery).toHaveBeenCalledWith(testCampaignId);
    });

    it("should call useDeleteCombat with correct campaignId", () => {
      mockUseCombatsQuery.mockReturnValue({
        data: createMockCombatsList([]),
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

      mockUseDeleteCombatMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as Partial<UseMutationResult>);

      const testCampaignId = "test-campaign-999";
      render(<CombatsListView campaignId={testCampaignId} campaignName="Test" />);

      expect(mockUseDeleteCombatMutation).toHaveBeenCalledWith(testCampaignId);
    });

    it("should maintain header visibility across all states", () => {
      const states = [
        { isLoading: true, isError: false, data: undefined },
        { isLoading: false, isError: true, data: undefined },
        { isLoading: false, isError: false, data: createMockCombatsList([]) },
        { isLoading: false, isError: false, data: createMockCombatsList(createMockCombatsArray(1)) },
      ];

      states.forEach((state) => {
        mockUseCombatsQuery.mockReturnValue({
          ...state,
          refetch: mockRefetch,
        } as Partial<UseQueryResult<ListCombatsResponseDTO>>);

        mockUseDeleteCombatMutation.mockReturnValue({
          mutate: mockMutate,
          isPending: false,
        } as Partial<UseMutationResult>);

        const { unmount } = render(<CombatsListView campaignId={mockCampaignId} campaignName={mockCampaignName} />);

        expect(screen.getByTestId("combats-header")).toBeInTheDocument();

        unmount();
      });
    });
  });
});
