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

### Top-Down Isometric View

The overworld renders as a top-down camera with isometric sprites. Not isometric parallax —
a flat top-down perspective with iso-style buildings, props, and characters drawn in ¾ view.
Think classic top-down RPG camera with isometric art style.

Buildings use a rotational sprite trick (like Orna) — a single sprite rotates to face the
camera as the player moves around it. This avoids building 8-directional sprite sets for
every structure. The visual reads as 3D without actually being 3D.

### What You See

- Your vehicle (on roads) or character on foot (off-road)
- Biome-appropriate terrain (ground, props, ambient effects)
- Nearby buildings and structures (rotational sprites)
- Real-world location nodes (interactable points)
- Your safehouse (if within range — visible as a placed sprite with module sprites)
- Other players' vehicles (opt-in multiplayer presence)
- Weather effects driven by real-world weather data
- Time-of-day from RealtimeTOD (already built)

### Road vs Off-Road

The overworld has two movement modes that swap seamlessly:

**On Road — Vehicle**
- Roads always show the vehicle sprite
- Routes and node locations follow roads
- Fuel consumed by distance traveled
- Vehicle follows real road geometry on the map
- Faster travel, access to route-based nodes

**Off-Road — On Foot**
- Stepping off a road transitions to the character on foot
- Vehicle parks at the road edge (visible, stays put)
- Freeform exploration — no roads, no routes, move anywhere
- Scavenging, hidden loot caches, different enemy encounters
- No fuel cost for off-road movement
- Stepping back onto a road returns to the vehicle
- Smooth swap animation between vehicle and character

The vehicle is your road identity. The character is your off-road identity. Both exist
on the same overworld — the swap is contextual based on terrain.

### Movement and Route Travel

The overworld handles ALL travel between locations. There is no separate traversal scene
for moving between nodes. When you exit the safehouse on a planned route:

1. Plan route on CRT terminal (always loops back to safehouse)
2. Exit safehouse → you're on the overworld in your vehicle on the road
3. Vehicle follows real roads to the first destination on your route
4. Arrive at node → tap to enter (combat, haven, etc.)
5. Complete the node → back on the overworld
6. Vehicle continues along real roads to next node on route
7. Repeat until route is complete → you're back at safehouse

At any point during route travel, the player can step off-road to explore on foot.
The vehicle parks at the road edge. The player walks freely through the biome terrain —
scavenging, finding hidden caches, encountering off-road enemies. Returning to the
road resumes vehicle travel along the route.

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


## Road Trip Mode (Separate from Overworld)

Road Trip is a distinct game mode, completely separate from overworld navigation. The
overworld is local area exploration and combat. Road Trip is long-distance travel with
its own UI, pacing, and reward structure.

### How It Works

You set a real-world GPS destination — anywhere. Could be across town, across the state,
across the country. The game tracks your actual drive there. Road Trip mode has its own
full-screen UI focused on the journey itself.

### What Happens During a Road Trip

- **Biome road signs** appear when you cross biome reach boundaries — "NOW ENTERING:
  ASHVEIL" with biome-appropriate styling and ambient shift
- **Distance tracker** ticks up in real-time as you drive, showing total distance
  traveled and distance remaining
- **Fuel consumed** by real distance driven — longer trips cost more fuel
- **Passive loot and XP** awarded from POIs you pass along the route — gas stations,
  landmarks, buildings all generate drive-by rewards
- **Biome terrain shifts** as you cross boundaries — the visual backdrop changes from
  Ironfield smog to Mirelands fog to Scorchflats dust
- **Weather shifts** with real conditions along the route — weather updates as you
  move through different real-world weather zones
- **Landmarks pop up** as you approach them — named locations with bonus rewards
- **Other players visible** on the same stretch of road — see who else is Road Tripping
  through the same biome reach

### No Combat Interruptions

Road Trip mode does NOT interrupt you with combat encounters. You're driving. The
experience is passive, ambient, rewarding. If you want to fight, you pull over at
a node along your route and enter it manually. Road Trip is the scenic drive. The
overworld is where you get your hands dirty.

### Road Trip Milestones

Achievements and tracking specific to Road Trip mode:

- **Distance achievements** — 10km, 50km, 100km, 500km, 1000km driven in Road Trip
- **Biome collection** — visit all 6 biomes via Road Trip (Ironfield, Mirelands,
  Scorchflats, Hollows, Tidemarsh, Ashveil)
- **Longest single trip** — furthest distance in one continuous Road Trip session
- **Furthest from safehouse** — maximum distance between your safehouse and your
  Road Trip position
- **Biome streak** — pass through the most biome boundaries in a single trip
- **Road Warrior** — cumulative lifetime Road Trip distance

### Distinct from Overworld

The overworld is local. You walk around, you drive between nearby nodes, you explore
on foot, you fight. Road Trip is macro-scale. You're covering real distance, watching
the world change, collecting passive rewards. Different UI, different pacing, different
rewards. Both use GPS. Both exist on the same biome grid. But they serve completely
different gameplay needs.


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
- Top-down overworld scene with iso sprites (new primary view, replaces MapScene)
- Vehicle on roads, character on foot off-road (smooth swap animation)
- Road/off-road terrain distinction (roads consume fuel, off-road is free exploration)
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

### Phase 6: Road Trip Mode
- Road Trip scene with long-distance travel UI
- Real GPS destination setting and route tracking
- Biome road signs at reach boundaries
- Distance tracker, fuel consumption by real distance
- Passive loot/XP from POIs along route
- Biome terrain and weather shifts during travel
- Landmark pop-ups with bonus rewards
- Road Trip milestones and achievements (distance, biome collection, furthest from safehouse)
- Other player visibility on same road stretch

### Phase 7: Server + Persistence
- Auth, accounts
- State persistence (replace localStorage)
- Biome grid validation (global seed)
- Shared world nodes
- Fuel purchase backend
- Player presence service (WebSocket)
