import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type {
  CombatDTO,
  CombatParticipantDTO,
  CombatSnapshotDTO,
  CreateCombatCommand,
  InitialParticipantCommand,
  MonsterDataDTO,
  PlayerCharacter,
  ActionDTO,
  CombatSummaryDTO,
  ListCombatsResponseDTO,
} from '@/types';

/**
 * Creates a new combat encounter with initial participants
 */
export async function createCombat(
  supabase: SupabaseClient<Database>,
  userId: string,
  campaignId: string,
  command: CreateCombatCommand
): Promise<CombatDTO> {
  // Verify campaign ownership
  await verifyCampaignOwnership(supabase, userId, campaignId);

  // Resolve all participants in parallel
  const participants = await resolveAllParticipants(supabase, campaignId, command.initial_participants);

  // Build initial snapshot
  const snapshot = buildInitialSnapshot(participants);

  // Insert combat into database
  const { data, error } = await supabase
    .from("combats")
    .insert({
      campaign_id: campaignId,
      name: command.name,
      status: "active",
      current_round: 1,
      state_snapshot: snapshot as unknown as Database["public"]["Tables"]["combats"]["Insert"]["state_snapshot"],
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating combat:", error);
    throw new Error("Failed to create combat");
  }

  return data as unknown as CombatDTO;
}

/**
 * Verifies that the campaign exists and belongs to the user
 */
async function verifyCampaignOwnership(
  supabase: SupabaseClient<Database>,
  userId: string,
  campaignId: string
): Promise<void> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Campaign not found");
  }
}

/**
 * Resolves all participants from the initial participant commands
 */
async function resolveAllParticipants(
  supabase: SupabaseClient<Database>,
  campaignId: string,
  participants: InitialParticipantCommand[]
): Promise<CombatParticipantDTO[]> {
  const resolvedParticipants: CombatParticipantDTO[] = [];

  // Process all participants
  for (const participant of participants) {
    if (participant.source === "player_character") {
      const pc = await resolvePlayerCharacter(supabase, campaignId, participant.player_character_id);
      resolvedParticipants.push(pc);
    } else if (participant.source === "monster") {
      const monsters = await resolveMonster(supabase, participant.monster_id, participant.count || 1);
      resolvedParticipants.push(...monsters);
    } else if (participant.source === "ad_hoc_npc") {
      const npc = createAdHocParticipant(participant);
      resolvedParticipants.push(npc);
    }
  }

  return resolvedParticipants;
}

/**
 * Resolves a player character from the database
 */
async function resolvePlayerCharacter(
  supabase: SupabaseClient<Database>,
  campaignId: string,
  playerId: string
): Promise<CombatParticipantDTO> {
  const { data, error } = await supabase
    .from("player_characters")
    .select("*")
    .eq("id", playerId)
    .eq("campaign_id", campaignId)
    .single();

  if (error || !data) {
    throw new Error(`Player character not found: ${playerId}`);
  }

  const pc = data as unknown as PlayerCharacter;

  return {
    id: crypto.randomUUID(),
    source: "player_character",
    player_character_id: pc.id,
    display_name: pc.name,
    initiative: null,
    current_hp: pc.max_hp,
    max_hp: pc.max_hp,
    armor_class: pc.armor_class,
    stats: {
      str: pc.strength,
      dex: pc.dexterity,
      con: pc.constitution,
      int: pc.intelligence,
      wis: pc.wisdom,
      cha: pc.charisma,
    },
    actions: (pc.actions as unknown as ActionDTO[]) || [],
    is_active_turn: false,
    active_conditions: [],
  };
}

/**
 * Resolves a monster from the database (with count for multiple copies)
 */
async function resolveMonster(
  supabase: SupabaseClient<Database>,
  monsterId: string,
  count: number
): Promise<CombatParticipantDTO[]> {
  if (count > 10) {
    throw new Error("Maximum 10 copies of a single monster allowed");
  }

  const { data, error } = await supabase.from("monsters").select("*").eq("id", monsterId).single();

  if (error || !data) {
    throw new Error(`Monster not found: ${monsterId}`);
  }

  const monsterData = data.data as unknown as MonsterDataDTO;

  // Create multiple copies if count > 1
  const monsters: CombatParticipantDTO[] = [];
  for (let i = 0; i < count; i++) {
    const displayName = count > 1 ? `${monsterData.name.pl} #${i + 1}` : monsterData.name.pl;
    const displayNameLocalized =
      count > 1
        ? {
            en: `${monsterData.name.en} #${i + 1}`,
            pl: `${monsterData.name.pl} #${i + 1}`,
          }
        : {
            en: monsterData.name.en,
            pl: monsterData.name.pl,
          };

    monsters.push({
      id: crypto.randomUUID(),
      source: "monster",
      monster_id: monsterId,
      display_name: displayName,
      display_name_localized: displayNameLocalized,
      initiative: null,
      current_hp: monsterData.hitPoints.average,
      max_hp: monsterData.hitPoints.average,
      armor_class: monsterData.armorClass,
      stats: {
        str: monsterData.abilityScores.strength.score,
        dex: monsterData.abilityScores.dexterity.score,
        con: monsterData.abilityScores.constitution.score,
        int: monsterData.abilityScores.intelligence.score,
        wis: monsterData.abilityScores.wisdom.score,
        cha: monsterData.abilityScores.charisma.score,
      },
      actions: mapMonsterActions(monsterData.actions),
      // Combat properties
      damageVulnerabilities:
        monsterData.damageVulnerabilities?.length > 0 ? monsterData.damageVulnerabilities : undefined,
      damageResistances: monsterData.damageResistances?.length > 0 ? monsterData.damageResistances : undefined,
      damageImmunities: monsterData.damageImmunities?.length > 0 ? monsterData.damageImmunities : undefined,
      conditionImmunities: monsterData.conditionImmunities?.length > 0 ? monsterData.conditionImmunities : undefined,
      gear: monsterData.gear?.length > 0 ? monsterData.gear : undefined,
      // Additional abilities
      traits: monsterData.traits?.length > 0 ? monsterData.traits : undefined,
      bonusActions: monsterData.bonusActions?.length > 0 ? monsterData.bonusActions : undefined,
      reactions: monsterData.reactions?.length > 0 ? monsterData.reactions : undefined,
      legendaryActions: monsterData.legendaryActions,
      is_active_turn: false,
      active_conditions: [],
    });
  }

  return monsters;
}

/**
 * Maps monster actions to the common ActionDTO format
 */
function mapMonsterActions(monsterActions: MonsterDataDTO["actions"]): ActionDTO[] {
  if (!monsterActions || !Array.isArray(monsterActions)) {
    return [];
  }
  return monsterActions.map((action) => ({
    name: action.name,
    type: action.type || "action",
    attack_bonus: action.attackRoll?.bonus,
    range: (action as unknown as { range?: string }).range,
    damage_dice: action.damage?.[0]?.formula,
    damage_type: action.damage?.[0]?.type,
    description: action.description,
    attackRoll: action.attackRoll,
    damage: action.damage,
  })) as ActionDTO[];
}

/**
 * Creates an ad-hoc NPC participant from the command
 */
function createAdHocParticipant(
  spec: Extract<InitialParticipantCommand, { source: "ad_hoc_npc" }>
): CombatParticipantDTO {
  return {
    id: crypto.randomUUID(),
    source: "ad_hoc_npc",
    display_name: spec.display_name,
    initiative: null,
    current_hp: spec.max_hp,
    max_hp: spec.max_hp,
    armor_class: spec.armor_class,
    stats: spec.stats,
    actions: spec.actions || [],
    is_active_turn: false,
    active_conditions: [],
  };
}

/**
 * Builds the initial combat snapshot with all participants
 */
function buildInitialSnapshot(participants: CombatParticipantDTO[]): CombatSnapshotDTO {
  return {
    participants,
    active_participant_index: null, // Initiative not rolled yet
  };
}

/**
 * Gets a single combat by ID
 */
export async function getCombat(
  supabase: SupabaseClient<Database>,
  userId: string,
  combatId: string
): Promise<CombatDTO> {
  const { data, error } = await supabase
    .from("combats")
    .select("*, campaigns!inner(user_id)")
    .eq("id", combatId)
    .single();

  if (error || !data) {
    throw new Error("Combat not found");
  }

  // Type assertion needed due to join
  const combat = data as unknown as CombatDTO & { campaigns: { user_id: string } };

  // Verify ownership
  if (combat.campaigns.user_id !== userId) {
    throw new Error("Combat not found");
  }

  // Remove the campaigns field from the response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { campaigns, ...combatData } = combat;
  return combatData as CombatDTO;
}

/**
 * Updates the combat state snapshot
 */
export async function updateCombatSnapshot(
  supabase: SupabaseClient<Database>,
  userId: string,
  combatId: string,
  stateSnapshot: CombatSnapshotDTO,
  currentRound: number
): Promise<CombatDTO> {
  // First verify ownership
  await verifyCombatOwnership(supabase, userId, combatId);

  const { data, error } = await supabase
    .from("combats")
    .update({
      state_snapshot: stateSnapshot as unknown as Database["public"]["Tables"]["combats"]["Update"]["state_snapshot"],
      current_round: currentRound,
    })
    .eq("id", combatId)
    .select()
    .single();

  if (error) {
    console.error("Error updating combat snapshot:", error);
    throw new Error("Failed to update combat snapshot");
  }

  return data as unknown as CombatDTO;
}

/**
 * Updates the combat status
 */
export async function updateCombatStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
  combatId: string,
  status: "active" | "completed"
): Promise<CombatDTO> {
  // First verify ownership
  await verifyCombatOwnership(supabase, userId, combatId);

  const { data, error } = await supabase.from("combats").update({ status }).eq("id", combatId).select().single();

  if (error) {
    console.error("Error updating combat status:", error);
    throw new Error("Failed to update combat status");
  }

  return data as unknown as CombatDTO;
}

/**
 * Deletes a combat
 */
export async function deleteCombat(
  supabase: SupabaseClient<Database>,
  userId: string,
  combatId: string
): Promise<void> {
  // First verify ownership
  await verifyCombatOwnership(supabase, userId, combatId);

  const { error } = await supabase.from("combats").delete().eq("id", combatId);

  if (error) {
    console.error("Error deleting combat:", error);
    throw new Error("Failed to delete combat");
  }
}

/**
 * Verifies that the combat exists and belongs to the user
 */
async function verifyCombatOwnership(
  supabase: SupabaseClient<Database>,
  userId: string,
  combatId: string
): Promise<void> {
  const { data, error } = await supabase
    .from("combats")
    .select("id, campaigns!inner(user_id)")
    .eq("id", combatId)
    .single();

  if (error || !data) {
    throw new Error("Combat not found");
  }

  // Type assertion needed due to join
  const combat = data as unknown as { id: string; campaigns: { user_id: string } };

  if (combat.campaigns.user_id !== userId) {
    throw new Error("Combat not found");
  }
}

/**
 * Lists all combats for a campaign with summary information
 */
export async function listCombats(
  supabase: SupabaseClient<Database>,
  userId: string,
  campaignId: string,
  options?: {
    status?: "active" | "completed";
    limit?: number;
    offset?: number;
  }
): Promise<ListCombatsResponseDTO> {
  // Verify campaign ownership
  await verifyCampaignOwnership(supabase, userId, campaignId);

  const { status, limit = 50, offset = 0 } = options || {};

  // Build query
  let query = supabase
    .from("combats")
    .select("*", { count: "exact" })
    .eq("campaign_id", campaignId)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply status filter if provided
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error listing combats:", error);
    throw new Error("Failed to list combats");
  }

  // Transform to CombatSummaryDTO
  const combats: CombatSummaryDTO[] = (data || []).map((combat) => {
    const snapshot = combat.state_snapshot as unknown as CombatSnapshotDTO | null;
    const participantCount = snapshot?.participants?.length || 0;

    return {
      id: combat.id,
      campaign_id: combat.campaign_id,
      name: combat.name,
      status: combat.status as "active" | "completed",
      current_round: combat.current_round || 1,
      participant_count: participantCount,
      created_at: combat.created_at,
      updated_at: combat.updated_at || combat.created_at,
    };
  });

  return {
    combats,
    total: count || 0,
    limit,
    offset,
  };
}
