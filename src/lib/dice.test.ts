// Unit tests for D&D 5e dice rolling utilities
// Tests cover business logic, edge cases, and D&D combat rules

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { ActionDTO } from "@/types";
import type { RollMode } from "@/types/combat-view.types";
import {
  rollDice,
  calculateModifier,
  rollD20,
  rollDamage,
  executeAttack,
  formatRollResult,
  createRollResults,
} from "./dice";

// ============================================================================
// Mock Setup
// ============================================================================

// Mock Math.random for deterministic tests
let randomMock: ReturnType<typeof vi.spyOn>;

// Mock crypto.randomUUID for predictable IDs
const mockUUIDs = [
  "uuid-1",
  "uuid-2",
  "uuid-3",
  "uuid-4",
  "uuid-5",
  "uuid-6",
  "uuid-7",
  "uuid-8",
];
let uuidIndex = 0;

beforeEach(() => {
  // Reset UUID counter
  uuidIndex = 0;

  // Mock crypto.randomUUID with circular buffer to prevent undefined
  vi.stubGlobal("crypto", {
    randomUUID: () => mockUUIDs[uuidIndex++ % mockUUIDs.length],
  });
});

afterEach(() => {
  // Restore all mocks after each test
  if (randomMock) {
    randomMock.mockRestore();
  }
  vi.unstubAllGlobals();
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a test ActionDTO for attack actions
 */
function createTestAction(options: {
  name: string;
  attackBonus?: number;
  damage?: Array<{ formula: string; type: string }>;
}): ActionDTO {
  return {
    id: "test-action-id",
    name: options.name,
    description: "Test action description",
    attackRoll: options.attackBonus !== undefined
      ? { bonus: options.attackBonus }
      : undefined,
    damage: options.damage,
  };
}

/**
 * Mock Math.random to return specific sequence of values
 * @param values Array of values 0-1 to return
 */
function mockRandomSequence(values: number[]): void {
  let callCount = 0;
  randomMock = vi.spyOn(Math, "random").mockImplementation(() => {
    const value = values[callCount % values.length];
    callCount++;
    return value;
  });
}

// ============================================================================
// Tests: rollDice
// ============================================================================

describe("rollDice", () => {
  describe("deterministic tests (with Math.random mock)", () => {
    it("should roll a single d6 with mocked value", () => {
      // floor(Math.random() * 6) + 1 → floor(0.5 * 6) + 1 = floor(3) + 1 = 4
      mockRandomSequence([0.5]);

      const result = rollDice(1, 6);

      expect(result).toEqual([4]);
    });

    it("should roll multiple dice with mocked values", () => {
      // First: floor(0.2 * 8) + 1 = floor(1.6) + 1 = 1 + 1 = 2
      // Second: floor(0.7 * 8) + 1 = floor(5.6) + 1 = 5 + 1 = 6
      mockRandomSequence([0.2, 0.7]);

      const result = rollDice(2, 8);

      expect(result).toEqual([2, 6]);
    });

    it("should roll d20 with edge values (1 and 20)", () => {
      // floor(0.0 * 20) + 1 = 0 + 1 = 1, floor(0.99 * 20) + 1 = floor(19.8) + 1 = 20
      mockRandomSequence([0.0, 0.99]);

      const result = rollDice(2, 20);

      expect(result).toEqual([1, 20]);
    });
  });

  describe("range validation tests (without mock)", () => {
    it("should return values within valid range for d6", () => {
      const result = rollDice(10, 6);

      expect(result).toHaveLength(10);
      result.forEach((roll) => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      });
    });

    it("should return values within valid range for d20", () => {
      const result = rollDice(10, 20);

      expect(result).toHaveLength(10);
      result.forEach((roll) => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(20);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle rolling 0 dice", () => {
      const result = rollDice(0, 6);

      expect(result).toEqual([]);
    });

    it("should handle rolling 1 die", () => {
      mockRandomSequence([0.5]);

      const result = rollDice(1, 20);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(11);
    });

    it("should handle rolling many dice (100d20)", () => {
      const result = rollDice(100, 20);

      expect(result).toHaveLength(100);
      result.forEach((roll) => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(20);
      });
    });

    it("should handle negative dice count (treat as 0)", () => {
      const result = rollDice(-5, 6);

      expect(result).toEqual([]);
    });

    it("should handle invalid die sides (0 sides)", () => {
      const result = rollDice(2, 0);

      // With 0 sides: floor(random * 0) + 1 = 0 + 1 = 1
      expect(result).toHaveLength(2);
      result.forEach((roll) => {
        expect(roll).toBe(1);
      });
    });

    it("should handle negative die sides", () => {
      mockRandomSequence([0.5]);

      const result = rollDice(1, -6);

      // With negative sides: floor(0.5 * -6) + 1 = floor(-3) + 1 = -3 + 1 = -2
      expect(result).toEqual([-2]);
    });
  });
});

// ============================================================================
// Tests: calculateModifier
// ============================================================================

describe("calculateModifier", () => {
  it("should calculate modifier for standard D&D ability scores", () => {
    // D&D 5e standard array and common scores
    expect(calculateModifier(1)).toBe(-5);  // Minimum possible
    expect(calculateModifier(3)).toBe(-4);  // Very low
    expect(calculateModifier(8)).toBe(-1);  // Below average
    expect(calculateModifier(10)).toBe(0);  // Average
    expect(calculateModifier(12)).toBe(1);  // Slightly above average
    expect(calculateModifier(15)).toBe(2);  // Good
    expect(calculateModifier(18)).toBe(4);  // Excellent
    expect(calculateModifier(20)).toBe(5);  // Maximum standard
    expect(calculateModifier(30)).toBe(10); // Legendary (theoretical max)
  });

  it("should return negative modifiers for scores below 10", () => {
    expect(calculateModifier(9)).toBe(-1);
    expect(calculateModifier(6)).toBe(-2);
    expect(calculateModifier(4)).toBe(-3);
  });

  it("should return positive modifiers for scores above 10", () => {
    expect(calculateModifier(11)).toBe(0);
    expect(calculateModifier(13)).toBe(1);
    expect(calculateModifier(16)).toBe(3);
  });

  it("should use floor rounding (formula: floor((score - 10) / 2))", () => {
    // Verify floor behavior with odd numbers
    expect(calculateModifier(11)).toBe(0);  // (11-10)/2 = 0.5 → 0
    expect(calculateModifier(13)).toBe(1);  // (13-10)/2 = 1.5 → 1
    expect(calculateModifier(9)).toBe(-1);  // (9-10)/2 = -0.5 → -1
  });
});

// ============================================================================
// Tests: rollD20
// ============================================================================

describe("rollD20", () => {
  describe("normal roll", () => {
    it("should roll 1d20 with positive modifier", () => {
      mockRandomSequence([0.5]); // 0.5 * 20 + 1 = 11

      const result = rollD20("normal", 5);

      expect(result.rolls).toEqual([11]);
      expect(result.result).toBe(16); // 11 + 5
      expect(result.isCrit).toBe(false);
      expect(result.isFail).toBe(false);
    });

    it("should roll 1d20 with negative modifier", () => {
      mockRandomSequence([0.5]); // 11

      const result = rollD20("normal", -2);

      expect(result.rolls).toEqual([11]);
      expect(result.result).toBe(9); // 11 - 2
      expect(result.isCrit).toBe(false);
      expect(result.isFail).toBe(false);
    });

    it("should detect natural 20 as critical hit", () => {
      mockRandomSequence([0.99]); // 20

      const result = rollD20("normal", 3);

      expect(result.rolls).toEqual([20]);
      expect(result.result).toBe(23);
      expect(result.isCrit).toBe(true);
      expect(result.isFail).toBe(false);
    });

    it("should detect natural 1 as critical fail", () => {
      mockRandomSequence([0.0]); // 1

      const result = rollD20("normal", 5);

      expect(result.rolls).toEqual([1]);
      expect(result.result).toBe(6);
      expect(result.isCrit).toBe(false);
      expect(result.isFail).toBe(true);
    });
  });

  describe("advantage roll", () => {
    it("should roll 2d20 and select the higher value", () => {
      mockRandomSequence([0.3, 0.7]); // 7, 15

      const result = rollD20("advantage", 2);

      expect(result.rolls).toEqual([7, 15]);
      expect(result.result).toBe(17); // max(7, 15) + 2
      expect(result.isCrit).toBe(false);
      expect(result.isFail).toBe(false);
    });

    it("should detect crit only on the selected die", () => {
      mockRandomSequence([0.5, 0.99]); // 11, 20

      const result = rollD20("advantage", 0);

      expect(result.rolls).toEqual([11, 20]);
      expect(result.result).toBe(20); // max(11, 20)
      expect(result.isCrit).toBe(true); // selected die is 20
    });

    it("should detect crit when both dice roll 20", () => {
      // Both dice roll 20 - max is 20, so crit is detected
      mockRandomSequence([0.99, 0.99]); // 20, 20

      const result = rollD20("advantage", 0);

      expect(result.rolls).toEqual([20, 20]);
      expect(result.result).toBe(20);
      expect(result.isCrit).toBe(true);
    });

    it("should detect fail only on the selected die", () => {
      mockRandomSequence([0.0, 0.0]); // 1, 1

      const result = rollD20("advantage", 0);

      expect(result.rolls).toEqual([1, 1]);
      expect(result.result).toBe(1); // max(1, 1)
      expect(result.isFail).toBe(true);
    });

    it("should not detect fail if 1 is not selected (higher die available)", () => {
      mockRandomSequence([0.0, 0.5]); // 1, 11

      const result = rollD20("advantage", 0);

      expect(result.rolls).toEqual([1, 11]);
      expect(result.result).toBe(11); // max(1, 11)
      expect(result.isFail).toBe(false); // selected die is 11, not 1
    });
  });

  describe("disadvantage roll", () => {
    it("should roll 2d20 and select the lower value", () => {
      mockRandomSequence([0.3, 0.7]); // 7, 15

      const result = rollD20("disadvantage", 2);

      expect(result.rolls).toEqual([7, 15]);
      expect(result.result).toBe(9); // min(7, 15) + 2
      expect(result.isCrit).toBe(false);
      expect(result.isFail).toBe(false);
    });

    it("should detect crit only on the selected die", () => {
      mockRandomSequence([0.99, 0.99]); // 20, 20

      const result = rollD20("disadvantage", 0);

      expect(result.rolls).toEqual([20, 20]);
      expect(result.result).toBe(20); // min(20, 20)
      expect(result.isCrit).toBe(true);
    });

    it("should not detect crit if 20 is not selected (lower die available)", () => {
      mockRandomSequence([0.5, 0.99]); // 11, 20

      const result = rollD20("disadvantage", 0);

      expect(result.rolls).toEqual([11, 20]);
      expect(result.result).toBe(11); // min(11, 20)
      expect(result.isCrit).toBe(false); // selected die is 11, not 20
    });

    it("should detect fail only on the selected die", () => {
      mockRandomSequence([0.0, 0.5]); // 1, 11

      const result = rollD20("disadvantage", 0);

      expect(result.rolls).toEqual([1, 11]);
      expect(result.result).toBe(1); // min(1, 11)
      expect(result.isFail).toBe(true); // selected die is 1
    });
  });
});

// ============================================================================
// Tests: rollDamage
// ============================================================================

describe("rollDamage", () => {
  describe("valid formulas", () => {
    it("should parse and roll '1d8+3'", () => {
      mockRandomSequence([0.5]); // 0.5 * 8 + 1 = 5

      const result = rollDamage("1d8+3");

      expect(result.formula).toBe("1d8+3");
      expect(result.rolls).toEqual([5]);
      expect(result.total).toBe(8); // 5 + 3
    });

    it("should parse and roll '2d6' (no modifier)", () => {
      mockRandomSequence([0.3, 0.7]); // 2, 5

      const result = rollDamage("2d6");

      expect(result.formula).toBe("2d6");
      expect(result.rolls).toEqual([2, 5]);
      expect(result.total).toBe(7); // 2 + 5
    });

    it("should parse and roll '1d10 + 5' (with spaces)", () => {
      mockRandomSequence([0.6]); // 7

      const result = rollDamage("1d10 + 5");

      expect(result.formula).toBe("1d10 + 5");
      expect(result.rolls).toEqual([7]);
      expect(result.total).toBe(12); // 7 + 5
    });

    it("should parse and roll '1d6-2' (negative modifier)", () => {
      mockRandomSequence([0.8]); // 5

      const result = rollDamage("1d6-2");

      expect(result.formula).toBe("1d6-2");
      expect(result.rolls).toEqual([5]);
      expect(result.total).toBe(3); // 5 - 2
    });

    it("should parse and roll '1d6 - 2' (negative modifier with spaces)", () => {
      mockRandomSequence([0.8]); // 5

      const result = rollDamage("1d6 - 2");

      expect(result.formula).toBe("1d6 - 2");
      expect(result.rolls).toEqual([5]);
      expect(result.total).toBe(3); // 5 - 2
    });
  });

  describe("invalid formulas", () => {
    it("should return 0 for empty string", () => {
      const result = rollDamage("");

      expect(result.formula).toBe("");
      expect(result.rolls).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should return 0 for 'invalid'", () => {
      const result = rollDamage("invalid");

      expect(result.formula).toBe("invalid");
      expect(result.rolls).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should return 0 for '999' (no dice notation)", () => {
      const result = rollDamage("999");

      expect(result.formula).toBe("999");
      expect(result.rolls).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should return 0 for 'abc+def'", () => {
      const result = rollDamage("abc+def");

      expect(result.formula).toBe("abc+def");
      expect(result.rolls).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle large dice counts", () => {
      // Don't mock random for this - just verify range
      const result = rollDamage("10d6+5");

      expect(result.rolls).toHaveLength(10);
      expect(result.total).toBeGreaterThanOrEqual(15); // 10*1 + 5
      expect(result.total).toBeLessThanOrEqual(65); // 10*6 + 5
    });

    it("should handle negative total (high negative modifier)", () => {
      mockRandomSequence([0.0]); // 1

      const result = rollDamage("1d4-10");

      expect(result.total).toBe(-9); // 1 - 10
    });

    it("should handle very large modifier", () => {
      mockRandomSequence([0.5]); // floor(0.5 * 6) + 1 = 4

      const result = rollDamage("1d6+999999");

      expect(result.formula).toBe("1d6+999999");
      expect(result.rolls).toEqual([4]);
      expect(result.total).toBe(1000003); // 4 + 999999
    });

    it("should handle zero modifier formula", () => {
      mockRandomSequence([0.5]); // floor(0.5 * 8) + 1 = 5

      const result = rollDamage("1d8+0");

      expect(result.formula).toBe("1d8+0");
      expect(result.rolls).toEqual([5]);
      expect(result.total).toBe(5);
    });
  });
});

// ============================================================================
// Tests: executeAttack
// ============================================================================

describe("executeAttack", () => {
  describe("attack with damage", () => {
    it("should execute attack roll and damage roll", () => {
      // Attack: floor(0.7 * 20) + 1 = 14 + 1 = 15
      // Damage: floor(0.6 * 8) + 1 = floor(4.8) + 1 = 5
      mockRandomSequence([0.7, 0.6]);

      const action = createTestAction({
        name: "Longsword",
        attackBonus: 5,
        damage: [{ formula: "1d8+3", type: "slashing" }],
      });

      const result = executeAttack(action, "normal");

      expect(result.attack).toEqual({
        rolls: [15],
        result: 20, // 15 + 5
        isCrit: false,
        isFail: false,
      });
      expect(result.damage).toHaveLength(1);
      expect(result.damage[0]).toEqual({
        rolls: [5],
        total: 8, // 5 + 3
        formula: "1d8+3",
        type: "slashing",
      });
    });

    it("should execute attack with multiple damage types", () => {
      // Attack: 12, Fire: 4, Cold: 3
      mockRandomSequence([0.55, 0.4, 0.3]);

      const action = createTestAction({
        name: "Flaming Frostbrand",
        attackBonus: 3,
        damage: [
          { formula: "1d8+3", type: "slashing" },
          { formula: "1d6", type: "fire" },
          { formula: "1d6", type: "cold" },
        ],
      });

      const result = executeAttack(action, "normal");

      expect(result.attack?.result).toBe(15); // 12 + 3
      expect(result.damage).toHaveLength(3);
      expect(result.damage[0].type).toBe("slashing");
      expect(result.damage[1].type).toBe("fire");
      expect(result.damage[2].type).toBe("cold");
    });
  });

  describe("attack without damage (saving throw action)", () => {
    it("should execute attack roll only", () => {
      mockRandomSequence([0.8]);

      const action = createTestAction({
        name: "Touch Attack",
        attackBonus: 4,
        damage: undefined,
      });

      const result = executeAttack(action, "normal");

      expect(result.attack).toEqual({
        rolls: [17],
        result: 21,
        isCrit: false,
        isFail: false,
      });
      expect(result.damage).toEqual([]);
    });
  });

  describe("damage without attack (spell damage)", () => {
    it("should execute damage roll only", () => {
      mockRandomSequence([0.5, 0.6]);

      const action = createTestAction({
        name: "Magic Missile",
        damage: [{ formula: "2d4+2", type: "force" }],
      });

      const result = executeAttack(action, "normal");

      expect(result.attack).toBeNull();
      expect(result.damage).toHaveLength(1);
      expect(result.damage[0].type).toBe("force");
    });
  });

  describe("critical hits", () => {
    it("should double damage dice on crit (not the bonus)", () => {
      // Attack: 20 (crit), Damage: 5, then crit dice: 6
      mockRandomSequence([0.99, 0.5, 0.6]);

      const action = createTestAction({
        name: "Greatsword",
        attackBonus: 5,
        damage: [{ formula: "2d6+4", type: "slashing" }],
      });

      const result = executeAttack(action, "normal");

      expect(result.attack?.isCrit).toBe(true);
      expect(result.damage[0].rolls).toHaveLength(4); // 2 original + 2 crit
      // Total = 4 dice + 4 bonus (bonus not doubled)
      expect(result.damage[0].total).toBeGreaterThanOrEqual(8); // 4*1 + 4
      expect(result.damage[0].total).toBeLessThanOrEqual(28); // 4*6 + 4
    });

    it("should double all damage types on crit", () => {
      // Attack: 20, Slashing: 4, Fire: 3, then crit dice: 5, 2
      mockRandomSequence([0.99, 0.4, 0.3, 0.5, 0.2]);

      const action = createTestAction({
        name: "Flametongue",
        attackBonus: 5,
        damage: [
          { formula: "1d8+3", type: "slashing" },
          { formula: "1d6", type: "fire" },
        ],
      });

      const result = executeAttack(action, "normal");

      expect(result.attack?.isCrit).toBe(true);
      expect(result.damage[0].rolls).toHaveLength(2); // 1 original + 1 crit
      expect(result.damage[1].rolls).toHaveLength(2); // 1 original + 1 crit
    });

    it("should not double damage if no attack roll (spell damage)", () => {
      mockRandomSequence([0.5]);

      const action = createTestAction({
        name: "Fireball",
        damage: [{ formula: "8d6", type: "fire" }],
      });

      const result = executeAttack(action, "normal");

      expect(result.attack).toBeNull();
      expect(result.damage[0].rolls).toHaveLength(8); // No crit doubling
    });
  });

  describe("roll modes", () => {
    it("should execute attack with advantage", () => {
      mockRandomSequence([0.3, 0.7, 0.5]); // Attack: 7, 15 → 15; Damage: 5

      const action = createTestAction({
        name: "Sword",
        attackBonus: 3,
        damage: [{ formula: "1d8+2", type: "slashing" }],
      });

      const result = executeAttack(action, "advantage");

      expect(result.attack?.rolls).toEqual([7, 15]);
      expect(result.attack?.result).toBe(18); // max(7,15) + 3
    });

    it("should execute attack with disadvantage", () => {
      mockRandomSequence([0.3, 0.7, 0.5]); // Attack: 7, 15 → 7; Damage: 5

      const action = createTestAction({
        name: "Sword",
        attackBonus: 3,
        damage: [{ formula: "1d8+2", type: "slashing" }],
      });

      const result = executeAttack(action, "disadvantage");

      expect(result.attack?.rolls).toEqual([7, 15]);
      expect(result.attack?.result).toBe(10); // min(7,15) + 3
    });
  });
});

// ============================================================================
// Tests: formatRollResult
// ============================================================================

describe("formatRollResult", () => {
  it("should format single roll with positive modifier", () => {
    const result = formatRollResult([12], 5);

    expect(result).toBe("12 (+5) = 17");
  });

  it("should format single roll with negative modifier", () => {
    const result = formatRollResult([8], -2);

    expect(result).toBe("8 (-2) = 6");
  });

  it("should format single roll with zero modifier", () => {
    const result = formatRollResult([15], 0);

    expect(result).toBe("15 (+0) = 15");
  });

  it("should format multiple rolls with modifier", () => {
    const result = formatRollResult([3, 5, 2], 4);

    expect(result).toBe("3, 5, 2 (+4) = 14");
  });

  it("should format advantage rolls", () => {
    const result = formatRollResult([12, 18], 5);

    expect(result).toBe("12, 18 (+5) = 35");
  });

  it("should handle negative total", () => {
    const result = formatRollResult([1], -5);

    expect(result).toBe("1 (-5) = -4");
  });
});

// ============================================================================
// Tests: createRollResults
// ============================================================================

describe("createRollResults", () => {
  beforeEach(() => {
    // Reset UUID counter for predictable IDs
    uuidIndex = 0;
  });

  it("should create attack and damage roll results", () => {
    const action = createTestAction({
      name: "Longsword",
      attackBonus: 5,
      damage: [{ formula: "1d8+3", type: "slashing" }],
    });

    const attackResult = {
      rolls: [15],
      result: 20,
      isCrit: false,
      isFail: false,
    };

    const damageResults = [
      {
        rolls: [6],
        total: 9,
        formula: "1d8+3",
        type: "slashing",
      },
    ];

    const results = createRollResults(action, attackResult, damageResults);

    expect(results).toHaveLength(2);

    // Attack result
    expect(results[0]).toMatchObject({
      id: "uuid-1",
      type: "attack",
      result: 20,
      formula: "1d20+5",
      rolls: [15],
      modifier: 5,
      isCrit: false,
      isFail: false,
      actionName: "Longsword",
    });
    expect(results[0].timestamp).toBeInstanceOf(Date);

    // Damage result
    expect(results[1]).toMatchObject({
      id: "uuid-2",
      type: "damage",
      result: 9,
      formula: "1d8+3",
      rolls: [6],
      modifier: 3,
      actionName: "Longsword",
      damageType: "slashing",
    });
    expect(results[1].timestamp).toBeInstanceOf(Date);
  });

  it("should create multiple damage results for multiple damage types", () => {
    const action = createTestAction({
      name: "Flametongue",
      attackBonus: 5,
      damage: [
        { formula: "1d8+3", type: "slashing" },
        { formula: "2d6", type: "fire" },
      ],
    });

    const attackResult = {
      rolls: [12],
      result: 17,
      isCrit: false,
      isFail: false,
    };

    const damageResults = [
      { rolls: [5], total: 8, formula: "1d8+3", type: "slashing" },
      { rolls: [3, 4], total: 7, formula: "2d6", type: "fire" },
    ];

    const results = createRollResults(action, attackResult, damageResults);

    expect(results).toHaveLength(3); // 1 attack + 2 damage

    expect(results[0].type).toBe("attack");
    expect(results[1].type).toBe("damage");
    expect(results[1].damageType).toBe("slashing");
    expect(results[2].type).toBe("damage");
    expect(results[2].damageType).toBe("fire");
  });

  it("should create only damage results when no attack roll", () => {
    const action = createTestAction({
      name: "Magic Missile",
      damage: [{ formula: "1d4+1", type: "force" }],
    });

    const damageResults = [
      { rolls: [3], total: 4, formula: "1d4+1", type: "force" },
    ];

    const results = createRollResults(action, null, damageResults);

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("damage");
    expect(results[0].damageType).toBe("force");
  });

  it("should create only attack result when no damage", () => {
    const action = createTestAction({
      name: "Touch Attack",
      attackBonus: 4,
      damage: undefined,
    });

    const attackResult = {
      rolls: [18],
      result: 22,
      isCrit: false,
      isFail: false,
    };

    const results = createRollResults(action, attackResult, []);

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("attack");
  });

  it("should handle critical hit flags", () => {
    const action = createTestAction({
      name: "Crit Test",
      attackBonus: 3,
      damage: [{ formula: "1d6", type: "slashing" }],
    });

    const attackResult = {
      rolls: [20],
      result: 23,
      isCrit: true,
      isFail: false,
    };

    const damageResults = [
      { rolls: [4], total: 4, formula: "1d6", type: "slashing" },
    ];

    const results = createRollResults(action, attackResult, damageResults);

    expect(results[0].isCrit).toBe(true);
    expect(results[0].isFail).toBe(false);
  });

  it("should handle critical fail flags", () => {
    const action = createTestAction({
      name: "Fail Test",
      attackBonus: 5,
      damage: [{ formula: "1d8", type: "bludgeoning" }],
    });

    const attackResult = {
      rolls: [1],
      result: 6,
      isCrit: false,
      isFail: true,
    };

    const damageResults = [
      { rolls: [5], total: 5, formula: "1d8", type: "bludgeoning" },
    ];

    const results = createRollResults(action, attackResult, damageResults);

    expect(results[0].isCrit).toBe(false);
    expect(results[0].isFail).toBe(true);
  });

  it("should extract modifier from damage formula with spaces", () => {
    const action = createTestAction({
      name: "Test",
      damage: [{ formula: "1d8 + 5", type: "piercing" }],
    });

    const damageResults = [
      { rolls: [6], total: 11, formula: "1d8 + 5", type: "piercing" },
    ];

    const results = createRollResults(action, null, damageResults);

    expect(results[0].modifier).toBe(5);
  });

  it("should extract negative modifier from damage formula", () => {
    const action = createTestAction({
      name: "Test",
      damage: [{ formula: "1d6-2", type: "slashing" }],
    });

    const damageResults = [
      { rolls: [4], total: 2, formula: "1d6-2", type: "slashing" },
    ];

    const results = createRollResults(action, null, damageResults);

    expect(results[0].modifier).toBe(-2);
  });

  it("should handle attack formula with negative bonus", () => {
    const action = createTestAction({
      name: "Weak Attack",
      attackBonus: -2,
      damage: [{ formula: "1d4", type: "slashing" }],
    });

    const attackResult = {
      rolls: [10],
      result: 8,
      isCrit: false,
      isFail: false,
    };

    const damageResults = [
      { rolls: [2], total: 2, formula: "1d4", type: "slashing" },
    ];

    const results = createRollResults(action, attackResult, damageResults);

    expect(results[0].formula).toBe("1d20-2");
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("Integration: Full Attack Flow", () => {
  beforeEach(() => {
    uuidIndex = 0;
  });

  it("should execute full attack flow: executeAttack → createRollResults", () => {
    // Attack: floor(0.7 * 20) + 1 = 15, Damage: floor(0.6 * 8) + 1 = 5
    mockRandomSequence([0.7, 0.6]);

    const action = createTestAction({
      name: "Longsword",
      attackBonus: 5,
      damage: [{ formula: "1d8+3", type: "slashing" }],
    });

    // Execute attack
    const attackExecution = executeAttack(action, "normal");

    // Create roll results
    const rollResults = createRollResults(
      action,
      attackExecution.attack,
      attackExecution.damage
    );

    // Verify complete flow
    expect(rollResults).toHaveLength(2);

    expect(rollResults[0]).toMatchObject({
      type: "attack",
      result: 20, // 15 + 5
      formula: "1d20+5",
      actionName: "Longsword",
    });

    expect(rollResults[1]).toMatchObject({
      type: "damage",
      result: 8, // 5 + 3
      formula: "1d8+3",
      damageType: "slashing",
      actionName: "Longsword",
    });
  });

  it("should handle critical hit with multiple damage types (full flow)", () => {
    // Attack: 20 (crit), Slashing: 5, Fire: 4, Crit dice: 6, 3
    mockRandomSequence([0.99, 0.5, 0.4, 0.6, 0.3]);

    const action = createTestAction({
      name: "Flametongue",
      attackBonus: 5,
      damage: [
        { formula: "1d8+3", type: "slashing" },
        { formula: "1d6", type: "fire" },
      ],
    });

    // Execute attack (should double dice on crit)
    const attackExecution = executeAttack(action, "normal");

    expect(attackExecution.attack?.isCrit).toBe(true);
    expect(attackExecution.damage[0].rolls).toHaveLength(2); // Doubled
    expect(attackExecution.damage[1].rolls).toHaveLength(2); // Doubled

    // Create roll results
    const rollResults = createRollResults(
      action,
      attackExecution.attack,
      attackExecution.damage
    );

    expect(rollResults).toHaveLength(3); // 1 attack + 2 damage types

    expect(rollResults[0].isCrit).toBe(true);
    expect(rollResults[1].damageType).toBe("slashing");
    expect(rollResults[2].damageType).toBe("fire");
  });

  it("should handle spell damage without attack roll (full flow)", () => {
    // 8d6 fire damage
    mockRandomSequence([0.5, 0.6, 0.4, 0.7, 0.3, 0.8, 0.2, 0.9]);

    const action = createTestAction({
      name: "Fireball",
      damage: [{ formula: "8d6", type: "fire" }],
    });

    const attackExecution = executeAttack(action, "normal");

    expect(attackExecution.attack).toBeNull();
    expect(attackExecution.damage).toHaveLength(1);

    const rollResults = createRollResults(
      action,
      attackExecution.attack,
      attackExecution.damage
    );

    expect(rollResults).toHaveLength(1);
    expect(rollResults[0].type).toBe("damage");
    expect(rollResults[0].damageType).toBe("fire");
    expect(rollResults[0].rolls).toHaveLength(8);
  });

  it("should handle advantage attack with crit (full flow)", () => {
    // Attack: 12, 20 → 20 (crit with advantage), Damage: 5, Crit: 6
    mockRandomSequence([0.55, 0.99, 0.5, 0.6]);

    const action = createTestAction({
      name: "Greatsword",
      attackBonus: 4,
      damage: [{ formula: "2d6+3", type: "slashing" }],
    });

    const attackExecution = executeAttack(action, "advantage");

    expect(attackExecution.attack?.rolls).toEqual([12, 20]);
    expect(attackExecution.attack?.result).toBe(24); // 20 + 4
    expect(attackExecution.attack?.isCrit).toBe(true);
    expect(attackExecution.damage[0].rolls).toHaveLength(4); // 2 + 2 crit

    const rollResults = createRollResults(
      action,
      attackExecution.attack,
      attackExecution.damage
    );

    expect(rollResults[0].rolls).toEqual([12, 20]); // Both advantage rolls stored
    expect(rollResults[0].result).toBe(24);
    expect(rollResults[0].isCrit).toBe(true);
  });

  it("should handle disadvantage attack with fail (full flow)", () => {
    // Attack: 1, 15 → 1 (fail with disadvantage), Damage: 4
    mockRandomSequence([0.0, 0.7, 0.4]);

    const action = createTestAction({
      name: "Dagger",
      attackBonus: 2,
      damage: [{ formula: "1d4+2", type: "piercing" }],
    });

    const attackExecution = executeAttack(action, "disadvantage");

    expect(attackExecution.attack?.rolls).toEqual([1, 15]);
    expect(attackExecution.attack?.result).toBe(3); // 1 + 2
    expect(attackExecution.attack?.isFail).toBe(true);

    const rollResults = createRollResults(
      action,
      attackExecution.attack,
      attackExecution.damage
    );

    expect(rollResults[0].rolls).toEqual([1, 15]);
    expect(rollResults[0].result).toBe(3);
    expect(rollResults[0].isFail).toBe(true);
  });
});
