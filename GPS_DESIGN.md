# VESTIGE GPS — Gameplay Design v2

## The Core Idea

Your real world is Planet Raum. The game overlays an isometric overworld onto your GPS
position. Biomes aren't derived from real terrain — they tile the world in a procedural
grid, like Orna's territory system. A parking lot might be Ashveil. The park next to it
might be Mirelands. The game layer is its own world painted over reality.

GPS provides your position and movement. Real-world weather feeds into biome weather
patterns. Real-world locations become interactable nodes. But the biome map itself is
a game construct — consistent across all players, seeded globally.

Everything that exists — combat, loot, safehouse, foundries, The Cube — carries over
unchanged. GPS adds where you are and what's around you.


## The Overworld

The primary view. You open the game and you're here. This replaces the old MapScene
(node selection map) entirely. The CRT terminal remains as a route planning tool inside
the safehouse and vehicle, but the node-picker map is gone — the overworld IS the map.

### Isometric Parallax View

The overworld renders as an isometric parallax scene — similar to the existing Traversal
Scene's visual style. Your vehicle is your character on the overworld. Buildings, nodes,
and terrain features surround you based on your GPS position and the current biome.

Buildings use a rotational sprite trick (like Orna) — a single sprite rotates to face the
camera as the player moves around it. This avoids building 8-directional sprite sets for
every structure. The visual reads as 3D without actually being 3D.

### What You See

- Your vehicle (the player character — always present on overworld)
- Biome-appropriate terrain (ground, props, ambient effects)
- Nearby buildings and structures (rotational sprites)
- Real-world location nodes (interactable points)
- Your safehouse (if within range — visible as a placed sprite with module sprites)
- Other players' vehicles (opt-in multiplayer presence)
- Weather effects driven by real-world weather data
- Time-of-day from RealtimeTOD (already built)

### The Vehicle IS the Player

On the overworld, you are your vehicle. There is no separate walking character. The
vehicle is how you exist in the world, how other players see you, and how you interact
with nodes and POIs. Exiting the vehicle happens when you enter a node (combat, safehouse,
haven) — that's when you're on foot inside a specific scene.

### Movement and Route Travel

The overworld handles ALL travel between locations. There is no separate traversal scene
for moving between nodes. When you exit the safehouse on a planned route:

1. Plan route on CRT terminal (always loops back to safehouse)
2. Exit safehouse → you're on the overworld in your vehicle
3. Vehicle follows real roads to the first destination on your route
4. Arrive at node → tap to enter (combat, haven, etc.)
5. Complete the node → back on the overworld
6. Vehicle continues along real roads to next node on route
7. Repeat until route is complete → you're back at safehouse

The overworld IS the travel. The journey between nodes plays out visually on the overworld
with biome terrain, weather, and ambient life scrolling past as you move.

Players can also skip route planning and directly interact with any nearby node they
encounter on the overworld.


## Biome Reaches

The world is divided into a global grid of biome blocks. Each block is a Biome Reach.

### Grid System

- Global seed + Perlin noise determines biome assignment per grid cell
- All players see the same biome grid (consistent world)
- Grid cell size: following Orna's territory scale, slightly larger
- Walking/driving through the world crosses biome boundaries naturally
- Perlin noise creates natural-feeling biome clusters
- Each Biome Reach has its own reach progression (enemies, difficulty, loot)

### Six Biomes

| Biome         | Feel                                    | Weather Patterns        |
|-------------- |---------------------------------------- |------------------------ |
| Ironfield     | Rusted infrastructure, collapsed cities | Smog, acid rain, haze   |
| Mirelands     | Overgrown ruins, fungal growth, swamps  | Fog, drizzle, humidity  |
| Scorchflats   | Flat wasteland, dust, dried earth       | Dust storms, heat haze  |
| Hollows       | Deep chasms, collapsed mines, caverns   | Still air, echoes, dark |
| Tidemarsh     | Flooded ruins, tidal pools, coastline   | Rain, tidal surge, mist |
| Ashveil       | Toxic fog, Cube corruption, dead zones  | Ash fall, static, void  |

### Weather

Real-world weather data (WeatherSystem already built) maps to biome-specific weather
effects. Rain in the real world might trigger acid rain in Ironfield, fog in Mirelands,
or tidal surge in Tidemarsh. The same real weather produces different in-game effects
depending on which biome you're standing in.

### Foundry Control

Biomes can be foundry-controlled. Each Biome Reach may be claimed or associated with
a foundry, affecting NPC presence, gear flavor, and dialogue. The foundry territory
system will be expanded later — for now, the data model supports it.

### Reach Progression

Each Biome Reach has its own progression track:
- Enemy types specific to that biome
- Difficulty scaling within the reach
- A boss gate at the end/edge of the reach
- Loot tables weighted by biome
- Completion tracking per reach

### Safehouse Biome

The player's safehouse sits in whatever biome reach covers that GPS coordinate. If your
house happens to be in Ashveil, that's your reality on Raum. No special treatment.
Players choose where to place their safehouse knowing what biome it falls in.


## Safehouse

### Placement

Your safehouse is placed once at a real GPS coordinate — your home, your regular spot,
wherever you choose. It appears as a sprite on the overworld when you're within range.

### On the Overworld

The safehouse is a visible structure on the world map. Modular building elements you
construct appear as static sprites within the safehouse bounds on the overworld. A radio
antenna module gives more CRT map range. A watchtower module might reveal hidden nodes.
The safehouse grows visually as you build it.

### Inside the Safehouse

Entering the safehouse transitions to the existing SafehouseScene — rooms, stations,
NPCs, workbench, gym, CRT terminal. All current functionality unchanged. The modular
building system expands what rooms/stations are available based on what you've built.

### CRT Map (Safehouse + Vehicle)

The CRT terminal shows a scrollable map of real-world location nodes. Available in the
safehouse AND from the vehicle on the overworld. You can plan routes from either location.
Routes always loop back to the safehouse.

The range of what the CRT can see is affected by safehouse modules (radio antenna extends
range). The CRT is the planning tool. The overworld is the playing field.


## Playing Outside the Safehouse

When you leave your safehouse, you're on the overworld in your vehicle.

### Route-Based Play

Plan a route on the CRT. Exit safehouse. Your vehicle follows real roads to each node
on the route. Complete each node. Route loops you back home.

### Direct Interaction

Skip the CRT. Just drive/walk near a node on the overworld and tap it to enter. No
route needed for nearby nodes.

### Passive Rewards

Driving/walking near real-world POIs accrues passive rewards without entering combat:
- Fuel
- XP
- Loot
- Currency (bits, scrap)

The casual layer — commute to work, pick up resources along the way.

### Node Types from Real-World Locations

- Shops, restaurants, offices → Defense nodes, supply caches
- Parks, open areas → Defense nodes (open terrain variant)
- Churches, temples → Havens (safe zones, trade, recruit)
- Landmarks, monuments → Boss gates
- Gas stations → Fuel stations

Nodes are tied to real-world locations. The biome overlay is abstract, but the things
you interact with are real places.


## Fuel System

Fuel is the core monetization resource and range extender.

### What Fuel Does

- Used to travel outside your safehouse's home area
- Consumed based on distance traveled beyond safehouse range
- Extends your effective play radius

### Location Tracking Opt-In

Players who opt into location-based accuracy (continuous GPS tracking) can venture outside
the safehouse WITHOUT consuming fuel. This rewards real-world movement and incentivizes
the GPS experience. Players who don't opt in (or play from home) use fuel to extend range.

### Running Out

When fuel runs out (and you're not using location tracking), you can't travel further.
You use the Return Portal Device to mark your current position and return to safehouse.

### Return Portal Device

- Always available (not a consumable)
- Marks your current overworld position
- Returns you to safehouse instantly
- Portal persists at that location — revisit later with more fuel
- Dismiss the portal when you no longer want to return there
- Safety net, not a punishment mechanic

### Getting Fuel

- Passive accrual at safehouse over time
- Collected from fuel station nodes (real-world gas stations)
- Picked up from real-world POIs
- Purchased (premium monetization path)

### Design Intent

Fuel is NOT a hard gate. At your safehouse and immediate area, gameplay is free and
unlimited. Location tracking opt-in gives free range. Fuel is for players who want
extended range without continuous GPS, or who play from a fixed location.


## Driving Mode (Future — Separate from Overworld)

Driving is its own game mode entirely, separate from overworld route travel. It will be
designed and expanded later. It is NOT the same as traveling between nodes on the
overworld. The overworld handles route travel. Driving mode is a distinct gameplay
experience to be defined in a future design pass.


## Multiplayer Presence

Players can see other players' vehicles on the overworld. Opt-in, tied to location
tracking.

### How It Works

- Opt-in players broadcast vehicle position (throttled every 5-10 seconds)
- Nearby players appear as anonymous vehicle sprites on the overworld
- Visible within the same biome reach — not precise GPS (privacy)
- No stranger gets your exact coordinates

### Why This Matters

No GPS RPG does real-time player visibility. Seeing another vehicle drive through your
biome reach makes the world feel alive. Opens the door for emergent social play.

Start anonymous. Layer identity, groups, and interaction later.


## Deprecated Systems

- **MapScene (node selection map):** Replaced entirely by the overworld.
- **BiomeClassifier (real-terrain mapping):** Biomes are Perlin grid, not derived from
  OSM land-use data. Code stays in repo but unused in the GPS flow.


## What Doesn't Change

- Combat (GameScene): 12 waves, checkpoints, convoy defense
- Boss fights: 5 boss types with unique AI
- Weapons and loot: ItemManager, LootGen, all ITEM_DEFS
- Foundry system: 6 foundries with unique palettes, names, gear
- Safehouse interior: All stations, rooms, NPCs (CRT gets scrollable map upgrade)
- FreeRoam: Post-combat looting phase
- Survivors and squad: SurvivorGenerator, permadeath
- The Cube: Cosmic horror endgame
- Weather System: Real weather → biome-specific effects
- RealtimeTOD: Time of day from system clock


## Offline / GPS-Denied

The game must work without GPS.

- No GPS → Biome reaches generate around a virtual home position
- Nodes generate procedurally
- CRT route system works as always
- Fuel is the travel mechanism (no location tracking discount)
- All gameplay functional without real-world spatial context
- GPS is additive, not required


## What We Build (In Order)

### Phase 1: Overworld Foundation
- Isometric parallax overworld scene (new primary view, replaces MapScene)
- Vehicle as player character on overworld
- Rotational building sprites
- GPS position → vehicle movement on overworld
- Biome Reach grid generation (Perlin noise, global seed)
- Biome rendering (terrain, props, ambient per biome type)

### Phase 2: Route System + Node Integration
- CRT scrollable map with real-world location nodes
- Route planning (always loops home)
- Vehicle follows real roads between route nodes on overworld
- Real-world location → node type mapping
- Node markers on overworld (rotational sprites)
- Tap-to-enter → existing GameScene
- Return-from-combat → back to overworld with loot
- Passive POI rewards (drive near → collect)

### Phase 3: Fuel + Monetization
- Fuel resource system
- Distance-based consumption
- Location tracking opt-in (free range for GPS users)
- Return Portal Device (always available, marks position, revisit later)
- Fuel acquisition (passive, nodes, purchase)
- Premium fuel purchase flow

### Phase 4: Safehouse Overworld Presence
- Safehouse sprite on world map
- Module sprites visible on overworld (antenna, watchtower, etc.)
- Module effects on gameplay (CRT range, node visibility, etc.)
- Modular building expansion system

### Phase 5: Multiplayer Presence
- Location tracking → position broadcast (opt-in)
- Anonymous vehicle sprites on overworld
- Biome-reach-level visibility (not precise GPS)
- Foundation for future social features

### Phase 6: Driving Mode (Future)
- Full driving gameplay (separate from overworld travel)
- Design TBD

### Phase 7: Server + Persistence
- Auth, accounts
- State persistence (replace localStorage)
- Biome grid validation (global seed)
- Shared world nodes
- Fuel purchase backend
- Player presence service (WebSocket)
