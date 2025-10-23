import type { CombatSummaryDTO, ListCombatsResponseDTO } from "@/types";

/**
 * Factory function to create mock CombatSummaryDTO for testing
 */
export function createMockCombat(overrides?: Partial<CombatSummaryDTO>): CombatSummaryDTO {
  return {
    id: "combat-123",
    campaign_id: "campaign-456",
    name: "Dragon Encounter",
    status: "active",
    current_round: 1,
    participant_count: 5,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:30:00Z",
    ...overrides,
  };
}

/**
 * Factory function to create mock ListCombatsResponseDTO for testing
 */
export function createMockCombatsList(
  combats: CombatSummaryDTO[] = [],
  overrides?: Partial<ListCombatsResponseDTO>
): ListCombatsResponseDTO {
  return {
    combats,
    total: combats.length,
    page: 1,
    pageSize: 10,
    totalPages: Math.ceil(combats.length / 10),
    ...overrides,
  };
}

/**
 * Create multiple mock combats with sequential IDs
 */
export function createMockCombatsArray(count: number): CombatSummaryDTO[] {
  return Array.from({ length: count }, (_, index) =>
    createMockCombat({
      id: `combat-${index + 1}`,
      name: `Combat ${index + 1}`,
      status: index % 2 === 0 ? "active" : "completed",
      current_round: index + 1,
      participant_count: 3 + index,
    })
  );
}
