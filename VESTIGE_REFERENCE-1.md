# VESTIGE — Reference Document
# This is architecture and rules only. No session history.
# For task-specific work, provide the relevant code sections.

## WHAT THIS GAME IS
Post-apocalyptic convoy game on Planet Raum. HTML5 + Phaser 3.60, single file (game_2_.html). ¾ isometric perspective. Cosmic horror setting. Six foundries. The Cube.

**Core loop:** Safehouse → CRT Map (route select) → Defense mission at node → freeRoam (post-combat loot) → Return to Safehouse. Boss gates at end of each reach.

## GAMEPLAY LAYERS — DO NOT CONFUSE THESE
1. **Node Missions (Defense)** — Every non-boss/haven/safehouse map node. Player defends a stranded foundry convoy in a procedural biome. 12 waves, checkpoints at 3/6/9.
2. **Boss Gates** — Final node of each reach. Always a boss fight. One per reach.
3. **Traversal Events (future)** — Trigger DURING travel between nodes. Edge encounter skeleton exists but generates nothing. Separate layer from node missions.
4. **freeRoam** — Post-combat exploration phase. Not player-selectable. Triggers after defense/boss completion.

**Removed permanently (do not re-add):** Horde mode, story nodes, encounter mode, breakdown mode, scavenge_event mode, scavenge as a node type.

## ARCHITECTURE

### Single File Structure (top to bottom)
1. Extracted data constants (LORE_DATA, ENEMY_DEFS, BIOME_DEFS, LOCATION_DEFS, ITEM_DEFS, WEAPON_SPRITE_DATA, DEFENSE_DATA)
2. CONFIG object (references extracted constants)
3. Manager objects (UIManager, SpriteManager, AudioManager, ItemManager, etc.)
4. Helper objects (CRTTerminal, GymPanel, SleepPanel, WorkbenchPanel, NPCManager)
5. Scene classes
6. Phaser game instantiation

### Data Constants
All accessed via CONFIG.xxx (reference properties like `items: ITEM_DEFS.items`).

- **LORE_DATA** — lore, foundries, weaponFlavor, loreChips, loreSeries
- **ENEMY_DEFS** — enemyTypes
- **BIOME_DEFS** — biomes, worldNotes, storyScenes
- **LOCATION_DEFS** — locations, storyEvents, buildingArchetypes, buildingTemplates, propTemplates
- **ITEM_DEFS** — baseItems, items, lootTables
- **WEAPON_SPRITE_DATA** — foundryFrames, scrapFrames, foundryFX, foundryMeleeFX, etc.
- **DEFENSE_DATA** — foundry NPC names, dialogue, speech bubbles, wave tiers, checkpoint upgrades, soldier/shield/turret stats

### Scene Classes
- **SafehouseScene** — Hub with rooms, stations, NPCs, vehicle departure (~8k lines)
- **MapScene** — CRT route selection, node map (~4.5k lines)
- **GameScene** — Combat: defense mode, boss fights, enemies, weapons (~10k lines)
- **TraversalScene** — Driving between nodes (exists but decoupled, not active)
- **InteriorScene** — Building interiors, looting (~1.5k lines)
- **HavenScene** — Haven hub (~1.5k lines)
- **BiomeSelectScene, TitleScene, PortalDungeonScene, StoryScene, CubeSimScene**

### Key Managers
- **CONFIG** — game settings, references extracted constants
- **UIManager** — panels, buttons, dividers
- **SpriteManager** — vehicle, player, enemy, NPC sprites. `createNPCSprite()` auto-applies ambient tint.
- **AudioManager** — sound effects, ambient audio
- **ItemManager** — inventory, loot generation, stacking (scrap/consumables), equipment stats
- **NPCManager** — centralized NPC lifecycle. `spawn(scene, config)`, `updateAll(scene, dt)`, `destroyAll(scene)`. 7 behavior profiles. Foundry outfit table.
- **DynamicShadows** — time-of-day directional shadows
- **InteractHighlight** — station interaction glow/pulsing system
- **UIAtlas** — nine-slice panel textures
- **TerrainGenerator** — biome terrain generation
- **IsoRenderer** — ¾ isometric rendering
- **RealtimeTOD** — real-time time-of-day from system clock
- **WeatherSystem** — fetches live weather, maps to biome effects

### Helper Object Pattern
`ObjectName.method(scene, ...)` — scene passed as first arg.
SafehouseScene has delegation stubs: `showTerminal()` → `CRTTerminal.showTerminal(this)`.
Internal cross-calls use `ObjectName.method(scene, ...)` not `scene.method()`.

### NPCManager
- Registry: per-scene Map of NPC handles
- `NPCManager.spawn(scene, config)` → auto-applies ambient tint, shadow, depth sort
- `NPCManager.updateAll(scene, dt, opts)` — runs behavior AI. `{ freeze: true }` during dialogue
- `NPCManager.destroyAll(scene)` — cleanup on scene exit
- 7 behaviors: `idle_pace`, `waypoint_patrol`, `work_cycle`, `stationary`, `face_player`, `conversation`, `sentry`
- Foundry outfit table: `NPCManager.foundryOutfits[foundryId][role]` → preset ID
- Adding new foundry: add row to `foundryOutfits` + 3 preset entries in `SpriteManager.npcPresets`

## ¾ ISOMETRIC CAMERA RULES
Camera is above and south of player (70% front, 30% top).

- **North wall:** Front face wide and dominant, thin foreshortened top strip
- **South wall:** Rendered with Y-based depth + occlusion fade (player proximity → transparent)
- **East wall:** Side face dominant (depth panel), front is narrow compressed sliver receding left
- **West wall:** Mirror of east — side face dominant, front sliver receding right
- **Test:** If it looks like a squished front-facing version, it's WRONG. Side walls show a different face.
- Decorations only appear on front faces
- Side ≠ squished front

## RULES & CONVENTIONS

### Code Integrity
1. **41 LOCKED methods** — handcrafted safehouse props marked with ═══ LOCKED ═══ headers. NEVER replace with automated stubs.
2. **NEVER remove functions/features/systems** unless Mac explicitly asks. Fix root causes instead of deleting.
3. **NEVER remove, deprecate, or rewrite comments/notes** in the codebase. They are intentional documentation.

### Rendering
4. **Emoji only in CONFIG data definitions** (icon: fields), never in rendering code (add.text, setText, showMessage).
5. **"Center" means base-center** — object's base at center point, grows upward. Never offset to vertically middle-align the bounding box.
6. **UI elements must be dynamically sized** based on content — never use fixed dimensions that clip or waste space.
7. **After font size changes, recalc Y offsets:** uiPx(N) ≈ N*1.4px tall. Next element = prevY + textH + 2px min gap.

### Process
8. **Coordinate positioning:** Simulate in Python first. Print where elements land vs panel bounds. Catch overflow before writing code.
9. **InteractHighlight audit:** Overlays/transitions/modals must call `InteractHighlight.hide(this)` + `popupActive=true` before rendering.
10. **Ambient tint:** `_restoreTint(sprite)` replaces `sprite.clearTint()` for time-of-day aware tint restoration. It is NOT chainable (returns void).
11. **No tables in responses** — use plain text or prose for bug summaries.

### Quality
12. **Follow literal instructions.** No hedging, no reinterpretation, no "improving" without asking.
13. **No band-aids or rushing.** Fix issues in depth. Easy solutions only if they match the quality of a proper fix.
14. **Verify visual output before shipping.** Check sizes against existing objects. Think about how it will actually look on screen.
15. **Don't treat lists as checklists to clear** — treat each item as a problem to solve properly.

## TOOLKIT
Extract `vestige_toolkit.tar.gz` at session start. Install jsdom. Run before any work:
```
node vestige_audit.js game_2_.html    # static analysis
node smoke_test.js game_2_.html       # headless browser (needs Chrome)
```

**Pre-deploy checklist:**
1. Python mojibake scan
2. Brace/paren/bracket count
3. LOCKED method count (must be 41)
4. Copy to /mnt/user-data/outputs/
5. md5 verify working == output

**Context management:** Run `node context_estimate.js` periodically. Warn at 70%, hard cutoff at 80%.

### Available Tools
- **vestige_audit.js** — LOCKED count, brace balance, mojibake, CONFIG paths, duplicates, emoji, ghost modes
- **smoke_test.js** — headless browser load, runtime error capture (needs puppeteer + Chrome)
- **playthrough_test.js** — automated gameplay checks (35 tests)
- **visual_regression.js** — baseline screenshots + pixel diff
- **perf_profile.js** — frame timing, memory, GC pressure
- **mobile_perf.js** — CPU-throttled profiling, jank detection
- **perspective_audit.js** — validates ¾ iso bounding box ratios
- **asset_gen.js** — grid definition ↔ fillRect code ↔ preview PNG
- **loot_sim.js** — Monte Carlo loot table simulation
- **balance_analyzer.js** — DPS curves, TTK matrix, economy flow
- **wave_sim.js** — Monte Carlo combat survival simulation
- **pacing_analyzer.js** — scene transitions, content density, replayability
- **context_estimate.js** — context window usage estimate

## DEFENSE MODE QUICK REFERENCE
- 12 waves, checkpoint upgrades at 3/6/9, mini-boss at 12
- 6 foundries with unique palettes, NPC names, gear overlays
- Wave 3 upgrades: Barrier Shield / Damage Field / Repair Aura
- Wave 6 upgrades: Foundry Arsenal / Power Surge / Foundry Standing
- Wave 9 upgrades: Manual Turret / Reinforcements / Emergency Repair
- Convoy has HP, repair stages (smoke decreases), foundry-themed visuals
- 3 soldiers (guard, patrol, mechanic) with combat AI, downed/recovery states
- Shield types: barrier (blocks), damage_field (5 DPS), repair_aura (heals)
- Turret: mountable, auto-aim, overheat system
- Extract available at each checkpoint, full reward at wave 12 completion
- Post-defense transitions to freeRoam for exploration/looting

## SIX FOUNDRIES
TerraCorp, UCR, Deralict, Sworn, Blackreach, Cephalon.
Each has: unique color palette, NPC name pool, gear overlays (guard/patrol/mechanic), CRT phosphor theme.
