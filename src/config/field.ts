import type {
  CoordinateSystemDescription,
  GridVector3,
  WorldVector3,
} from '../types/coordinates';

/**
 * Logical dimensions of the play field measured in whole grid cells.
 */
export const FIELD_DIMENSIONS = Object.freeze({
  width: 10,
  height: 20,
  depth: 10,
});

/**
 * Length of a single grid cell edge in world units (meters) for the Three.js scene.
 */
export const CELL_SIZE = 1;

const HALF_CELL = CELL_SIZE / 2;
const HALF_WIDTH = (FIELD_DIMENSIONS.width * CELL_SIZE) / 2;
const HALF_DEPTH = (FIELD_DIMENSIONS.depth * CELL_SIZE) / 2;

/**
 * Shared description of the right-handed coordinate system used across the engine.
 *
 * - +X: right, -X: left
 * - +Y: up, -Y: down
 * - +Z: backward (away from the camera), -Z: forward (toward the camera)
 */
export const COORDINATE_SYSTEM: CoordinateSystemDescription = Object.freeze({
  up: 'y+',
  down: 'y-',
  left: 'x-',
  right: 'x+',
  forward: 'z-',
  backward: 'z+',
});

/**
 * The minimum world-space corner (left, bottom, front) of the field's bounding box.
 */
export const FIELD_MIN_CORNER: WorldVector3 = Object.freeze({
  x: -HALF_WIDTH,
  y: 0,
  z: -HALF_DEPTH,
});

/**
 * The maximum world-space corner (right, top, back) of the field's bounding box.
 */
export const FIELD_MAX_CORNER: WorldVector3 = Object.freeze({
  x: HALF_WIDTH,
  y: FIELD_DIMENSIONS.height * CELL_SIZE,
  z: HALF_DEPTH,
});

/**
 * World-space position of the center of the grid cell located at (0, 0, 0).
 */
export const GRID_ORIGIN: WorldVector3 = Object.freeze({
  x: FIELD_MIN_CORNER.x + HALF_CELL,
  y: FIELD_MIN_CORNER.y + HALF_CELL,
  z: FIELD_MIN_CORNER.z + HALF_CELL,
});

/**
 * Converts grid-space coordinates (indexed from the front-left-bottom corner) to world-space.
 */
export function gridToWorld(grid: GridVector3): WorldVector3 {
  return {
    x: GRID_ORIGIN.x + grid.x * CELL_SIZE,
    y: GRID_ORIGIN.y + grid.y * CELL_SIZE,
    z: GRID_ORIGIN.z + grid.z * CELL_SIZE,
  };
}

/**
 * Converts a world-space coordinate into grid-space. The result is not rounded to
 * the nearest integer so callers can decide how to handle interpolation.
 */
export function worldToGrid(world: WorldVector3): GridVector3 {
  return {
    x: (world.x - GRID_ORIGIN.x) / CELL_SIZE,
    y: (world.y - GRID_ORIGIN.y) / CELL_SIZE,
    z: (world.z - GRID_ORIGIN.z) / CELL_SIZE,
  };
}
