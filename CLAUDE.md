# CLAUDE.md — Vestige GPS RPG

## What This Is

Vestige is an HTML5/Phaser 3.60 GPS RPG set on Planet Raum after "the Collapse." Originally a single-file convoy defense game (game_2_.html), now extracted into ES modules via Vite. The game overlays a post-apocalyptic world onto real GPS coordinates using a Perlin noise biome grid. Cosmic horror setting, six foundries, The Cube.

## Project Structure

```
vestige-gps/
├── client/           # Phaser renderer layer
│   ├── scenes/       # 15 scene classes (SafehouseScene, GameScene, OverworldScene, etc.)
│   ├── rendering/    # Render bridges (combatRenderer, enemyManagerRenderer, etc.)
│   ├── main.js       # Entry point — scene registration, Phaser game config
│   └── *.js          # Managers (spriteManager, audioManager, uiManager, etc.)
├── core/             # Framework-independent game logic
│   ├── biomeGrid.js  # Perlin noise → biome assignment (GPS → grid cell → biome)
│   └── *.js          # Combat, items, enemies, weather, save, etc.
├── data/             # Static data constants (config, biomes, enemies, items, lore, weapons)
├── server/           # Express server (future multiplayer)
├── tests/            # Browser/integration/gameplay tests
├── dist/             # Vite build output
└── vite.config.js    # Build config (base: './')
```

## Build & Deploy

```bash
npm run dev          # Dev server with HMR
npm run build        # Production build → dist/
```

**GitHub Pages deployment (flat):**
```bash
npx vite build
cp dist/assets/*.js <deploy-dir>/
sed 's|./assets/|./|g' dist/index.html > <deploy-dir>/index.html
```
Live at: lattymoy.github.io (all files flat in repo root, no assets/ subfolder)

**Post-build verification (MANDATORY after every build + flatten):**
Confirm every `<script src>` and `<link href>` in index.html points to a file that actually exists in the repo root. No `./assets/` prefix — all paths must be `./filename.js`. If any path references `./assets/`, the deploy will black-screen (404 on every module load).

## GPS RPG Architecture

### Biome Grid (core/biomeGrid.js)
- World divided into ~750m grid cells
- Perlin noise with global seed (42) assigns biomes via dual-axis lookup (temperature × moisture)
- 6 biomes: Ironfield, Mirelands, Scorchflats, Hollows, Tidemarsh, Ashveil
- All players see the same grid (deterministic from seed)
- `BiomeGrid.getBiome(lat, lng)` → biome ID, cell coords, reach ID

### OverworldScene (client/scenes/OverworldScene.js)
- **Primary navigation view** — top-down camera with isometric sprites (not isometric parallax)
- Roads always show the vehicle. Off-road shows the character on foot
- Routes and node locations always follow roads
- Off-road is freeform exploration — scavenging, hidden loot, different enemies, no fuel cost
- Vehicle parks at road edge when player steps off-road. Character returns to vehicle when stepping back on road. Smooth swap animation
- Biome grid cells render as ground tiles with unique patterns per biome
- Iso-style buildings and props generated deterministically per cell
- Uses VehicleFleet sprites with 4 directional frames (up/down/left/right)
- GPS via `navigator.geolocation.watchPosition`, falls back to drag-to-move
- Tile streaming: only visible cells rendered, destroyed when out of range

### Core Loop (planned)
Safehouse → Overworld (route planning via CRT or direct exploration) → Node combat → freeRoam → Return

### Three Modes
1. **Safehouse** — hub with rooms, stations, NPCs, workbench, gym, CRT terminal
2. **Field** — combat (12-wave defense), boss fights, freeRoam exploration
3. **Road Trip** — long-distance GPS travel mode (separate from overworld). Set a real destination, track actual drive, biome signs at boundaries, passive loot/XP from POIs, no combat interruptions unless you pull over. Own UI and pacing

### GPS Design Principles
- GPS provides position context, not a gate — game works without GPS
- Biome grid is abstract (Perlin noise), NOT derived from real-world terrain
- Real-world weather → biome-specific effects (rain → acid rain in Ironfield, etc.)
- Nodes tied to real-world locations (shops → defense, churches → havens, landmarks → bosses)
- Fuel system for monetization (location tracking opt-in = free range)
- Multiplayer presence: opt-in anonymous vehicle sprites in same biome reach

## Existing Systems (Unchanged)

These were built in the monolith and extracted. They work. Don't rebuild them:

- **Combat (GameScene)** — 12-wave defense mode, 6 foundry themes, convoy HP, soldiers, shields, turrets
- **Boss fights** — BossAI with 5 entity types
- **Weapons/loot** — ItemManager, loot tables, stacking, equipment
- **Safehouse (SafehouseScene)** — rooms, stations, NPCs, workbench, gym, sleep, CRT terminal
- **freeRoam** — post-combat exploration/looting phase
- **VehicleFleet** — spritesheet with 5 vehicle types × 4 directions × 2 states (normal/wrecked)
- **SpriteManager** — vehicle, player, enemy, NPC sprites with ambient tint
- **NPCManager** — 7 behavior profiles, foundry outfit table
- **TerrainGenerator** — procedural biome terrain, buildings, props
- **WeatherSystem** — fetches real weather, maps to game effects
- **RealtimeTOD** — time-of-day from system clock
- **DynamicShadows** — directional shadows based on TOD

## Rules

### Code Integrity
1. **41 LOCKED methods** in SafehouseScene — handcrafted props marked with ═══ LOCKED ═══. NEVER replace.
2. **NEVER remove functions/features/systems** unless explicitly asked. Fix root causes.
3. **NEVER remove or rewrite comments/notes.** They are intentional documentation.

### Rendering
4. **Emoji only in CONFIG data definitions** (icon: fields), never in rendering code.
5. **"Center" means base-center** — object base at center point, grows upward.
6. **UI elements dynamically sized** — no fixed dimensions that clip or waste space.
7. **After font size changes, recalc Y offsets.** uiPx(N) ≈ N×1.4px tall.

### ¾ Isometric Rules (for iso sprites/buildings)
- North wall: front face wide/dominant, thin top strip
- East/West walls: side face dominant (depth panel), front is narrow compressed sliver
- South wall: occlusion fade
- If it looks like a squished front, it's WRONG — sides show a different face
- Decorations only on front faces

### Process
8. **Literal instructions.** No hedging, no reinterpretation, no "improving" without asking.
9. **No band-aids.** Fix in depth. Easy solutions only if same quality as proper fix.
10. **Verify visuals before shipping.** Check sizes against existing objects.
11. **No tables in responses** — plain text or prose.
12. **Coordinate positioning:** simulate in Python/JS first, print positions vs bounds, catch overflow.
13. **InteractHighlight audit:** overlays/modals must call `InteractHighlight.hide(this)` + `popupActive=true`.
14. **Ambient tint:** `_restoreTint(sprite)` replaces `sprite.clearTint()`. Returns void, not chainable.

## Key Files

| Purpose | File |
|---|---|
| Entry point | client/main.js |
| Game config | data/config.js |
| Biome grid | core/biomeGrid.js |
| Overworld | client/scenes/OverworldScene.js |
| Combat | client/scenes/GameScene.js |
| Safehouse | client/scenes/SafehouseScene.js |
| Vehicle sprites | client/vehicleFleet.js |
| Sprite system | client/spriteManager.js |
| Items/loot | core/itemManager.js |
| Terrain gen | core/terrainGenerator.js |
| Build config | vite.config.js |

## Current Phase

**Phase 1: Overworld Foundation** — top-down scene with Perlin biome grid, GPS-driven vehicle, tile streaming, iso building props, biome transitions. This is actively being built.

Next phases: Route system + node integration, fuel + monetization, safehouse overworld presence, multiplayer presence, Road Trip mode, server + persistence.
