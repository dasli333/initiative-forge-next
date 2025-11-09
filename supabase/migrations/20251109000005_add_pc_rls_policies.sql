-- ====================
-- RLS policies for player_character_combat_stats
-- ====================
-- Mirrors npc_combat_stats RLS pattern
-- Allows users to manage combat stats for PCs in their own campaigns

-- SELECT policies
create policy "users can view pc combat stats from own campaigns - anon" on player_character_combat_stats
  for select
  to anon
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_combat_stats.player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view pc combat stats from own campaigns - authenticated" on player_character_combat_stats
  for select
  to authenticated
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_combat_stats.player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

-- INSERT policies
create policy "users can create pc combat stats in own campaigns - anon" on player_character_combat_stats
  for insert
  to anon
  with check (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create pc combat stats in own campaigns - authenticated" on player_character_combat_stats
  for insert
  to authenticated
  with check (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

-- UPDATE policies
create policy "users can update pc combat stats from own campaigns - anon" on player_character_combat_stats
  for update
  to anon
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_combat_stats.player_character_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update pc combat stats from own campaigns - authenticated" on player_character_combat_stats
  for update
  to authenticated
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_combat_stats.player_character_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

-- DELETE policies
create policy "users can delete pc combat stats from own campaigns - anon" on player_character_combat_stats
  for delete
  to anon
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_combat_stats.player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete pc combat stats from own campaigns - authenticated" on player_character_combat_stats
  for delete
  to authenticated
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_combat_stats.player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- RLS policies for pc_npc_relationships
-- ====================
-- Mirrors npc_relationships RLS pattern
-- Allows users to manage PC-NPC relationships in their own campaigns

-- SELECT policies
create policy "users can view pc-npc relationships from own campaigns - anon" on pc_npc_relationships
  for select
  to anon
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = pc_npc_relationships.player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view pc-npc relationships from own campaigns - authenticated" on pc_npc_relationships
  for select
  to authenticated
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = pc_npc_relationships.player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

-- INSERT policies
create policy "users can create pc-npc relationships in own campaigns - anon" on pc_npc_relationships
  for insert
  to anon
  with check (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create pc-npc relationships in own campaigns - authenticated" on pc_npc_relationships
  for insert
  to authenticated
  with check (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

-- UPDATE policies
create policy "users can update pc-npc relationships from own campaigns - anon" on pc_npc_relationships
  for update
  to anon
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = pc_npc_relationships.player_character_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update pc-npc relationships from own campaigns - authenticated" on pc_npc_relationships
  for update
  to authenticated
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = pc_npc_relationships.player_character_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

-- DELETE policies
create policy "users can delete pc-npc relationships from own campaigns - anon" on pc_npc_relationships
  for delete
  to anon
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = pc_npc_relationships.player_character_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete pc-npc relationships from own campaigns - authenticated" on pc_npc_relationships
  for delete
  to authenticated
  using (
    exists (
      select 1 from player_characters
      join campaigns on campaigns.id = player_characters.campaign_id
      where player_characters.id = pc_npc_relationships.player_character_id
      and campaigns.user_id = auth.uid()
    )
  );
