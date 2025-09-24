/**
 * Identifies one of the three principal axes in the game's right-handed coordinate system.
 */
export type Axis = 'x' | 'y' | 'z';

/**
 * Expresses a directed axis where the `+` suffix denotes the positive direction and `-` the negative direction.
 */
export type DirectedAxis = `${Axis}+` | `${Axis}-`;

/**
 * Represents a position or offset in grid-space measured in logical cells.
 */
export interface GridVector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * Represents a position or offset in the world-space used by Three.js.
 */
export interface WorldVector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * Describes the semantic meaning of each axis direction in the shared coordinate system.
 */
export interface CoordinateSystemDescription {
  readonly up: DirectedAxis;
  readonly down: DirectedAxis;
  readonly left: DirectedAxis;
  readonly right: DirectedAxis;
  readonly forward: DirectedAxis;
  readonly backward: DirectedAxis;
}
