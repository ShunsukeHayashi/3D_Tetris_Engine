# Story 1.2: Tetromino Generation and Control

## Status
- in-progress

## Overview
Generate the standard set of tetromino pieces and enable basic movement/rotation controls within the 3D playfield, building on the field established in Story 1.1.

## Objectives
- Provide a reusable definition of all seven classic tetromino shapes across rotation states.
- Spawn tetrominoes into the field with consistent positioning and orientation rules.
- Allow the player to translate and rotate the active tetromino along the X/Y/Z axes.
- Keep the renderer and game state in sync as tetrominoes move.

## Tasks
- [ ] Define tetromino shape data (including rotations) in a shared constants module.
- [ ] Extend `GameState` to manage active tetromino, spawn queue, and occupancy updates.
- [ ] Add movement and rotation handlers in `GameEngine`, including basic collision/bounds checks.
- [ ] Render the active tetromino using Three.js meshes or instancing aligned with the field grid.
- [ ] Wire keyboard input (e.g., WASD/arrow keys/QE) to movement/rotation functions.
- [ ] Document public interfaces and usage patterns for upcoming logic stories.

## Acceptance Criteria
1. Launching the app spawns an initial tetromino positioned correctly within the playfield.
2. User input moves/rotates the active tetromino within bounds without clipping through walls or floor.
3. Movement updates are reflected visually and tracked in `GameState` without desynchronization.
4. Constants and interfaces are documented for reuse in subsequent collision/fixation logic.

## Definition of Done
- Code passes TypeScript compilation and existing build steps (`npm run build`).
- Manual validation steps (controls, rendering) are recorded in @memory-bank.mdc.
- Relevant Story log entries are added under `.ai/logs/` using the LDD format.
- No TODO/FIXME markers remain in committed changes.

## Dependencies
- `.ai/prd.md`
- `.ai/arch.md`
- `.ai/story-1-1.md`

## Notes
- Advanced collision resolution, scoring, and locking logic will be addressed in Story 1.3.
- Audio/visual polish remains out of scope until Epics in later PRDs.
