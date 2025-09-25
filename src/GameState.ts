import type { FieldCoordinate, FieldDimensions } from './constants/field';
import { FIELD_DIMENSIONS } from './constants/field';
import type { Axis } from './types/coordinates';
import {
  getTetrominoDefinition,
  getRandomTetrominoType,
  TETROMINO_TYPES,
  type TetrominoDefinition,
  type TetrominoType
} from './constants/tetromino';

/**
 * フィールド内のセルが取り得る状態。
 * 今後のストーリーでテトリミノの固定・衝突判定に拡張される想定。
 */
export type CellState = 'empty' | 'filled';

/**
 * ゲームの永続的な状態（グリッド、スコアなど）を保持するモデル層。
 * Story 1.1 の段階ではフィールドグリッドの初期化と公開 API のみを実装する。
 */
export class GameState {
  private readonly dimensions: FieldDimensions;
  private grid: CellState[][][];
  private activeTetromino: ActiveTetromino | null = null;
  private queue: TetrominoType[] = [];

  constructor(dimensions: FieldDimensions = FIELD_DIMENSIONS) {
    this.dimensions = dimensions;
    this.grid = this.createEmptyGrid();
  }

  /**
   * フィールドのグリッド寸法を外部モジュールに提供する。
   */
  public getDimensions(): FieldDimensions {
    return this.dimensions;
  }

  /**
   * 指定したセルの状態を取得する。境界外の場合は `undefined` を返す。
   */
  public getCell(coordinate: FieldCoordinate): CellState | undefined {
    if (!this.isWithinBounds(coordinate)) {
      return undefined;
    }

    const { x, y, z } = coordinate;
    return this.grid[y][x][z];
  }

  /**
   * フィールド全体を空の状態にリセットする。
   */
  public reset(): void {
    this.grid = this.createEmptyGrid();
    this.activeTetromino = null;
    this.queue = [];
  }

  /**
   * Story 1.2 以降で使用するための境界判定ユーティリティ。
   */
  public isWithinBounds({ x, y, z }: FieldCoordinate): boolean {
    const { width, height, depth } = this.dimensions;
    return (
      x >= 0 &&
      x < width &&
      y >= 0 &&
      y < height &&
      z >= 0 &&
      z < depth
    );
  }

  /**
   * Guarantees that an active tetromino exists by spawning one if necessary.
   */
  public ensureActiveTetromino(): void {
    if (!this.activeTetromino) {
      this.spawnTetromino();
    }
  }

  /**
   * Provides a snapshot of the active tetromino including absolute block coordinates.
   */
  public getActiveTetromino(): ActiveTetrominoSnapshot | null {
    if (!this.activeTetromino) {
      return null;
    }

    const { position, cells, type, color } = this.activeTetromino;
    return {
      type,
      color,
      blocks: cells.map((cell) => ({
        x: position.x + cell.x,
        y: position.y + cell.y,
        z: position.z + cell.z
      }))
    };
  }

  /**
   * Returns a preview of upcoming tetromino types from the spawn queue.
   */
  public getUpcomingQueue(length = 3): TetrominoType[] {
    if (this.queue.length < length) {
      this.refillBag();
    }
    return this.queue.slice(0, length);
  }

  /**
   * Attempts to move the active tetromino by the provided delta.
   * Returns true when the movement stays within bounds.
   */
  public moveActiveTetromino(delta: FieldCoordinate): boolean {
    if (!this.activeTetromino) {
      return false;
    }

    const candidatePosition: FieldCoordinate = {
      x: this.activeTetromino.position.x + delta.x,
      y: this.activeTetromino.position.y + delta.y,
      z: this.activeTetromino.position.z + delta.z
    };

    if (!this.canOccupy(candidatePosition, this.activeTetromino.cells)) {
      return false;
    }

    this.activeTetromino = {
      ...this.activeTetromino,
      position: candidatePosition
    };

    return true;
  }

  /**
   * Attempts to rotate the active tetromino 90° around the given axis.
   * Returns true when the rotation is valid.
   */
  public rotateActiveTetromino(axis: Axis, direction: RotationDirection): boolean {
    if (!this.activeTetromino) {
      return false;
    }

    const rotatedCells = this.activeTetromino.cells.map((cell) =>
      rotateCell(cell, axis, direction)
    );

    if (!this.canOccupy(this.activeTetromino.position, rotatedCells)) {
      return false;
    }

    this.activeTetromino = {
      ...this.activeTetromino,
      cells: rotatedCells
    };

    return true;
  }

  /**
   * Spawns a tetromino either from the queue or by forcing a specific type.
   */
  public spawnTetromino(forcedType?: TetrominoType): void {
    const type = forcedType ?? this.dequeueNextType();
    const definition = getTetrominoDefinition(type);
    const position = this.getSpawnPosition(definition);

    const cells = definition.cells.map((cell) => ({ ...cell }));

    const instance: ActiveTetromino = {
      type,
      color: definition.color,
      position,
      cells
    };

    if (!this.canOccupy(instance.position, instance.cells)) {
      // Attempt to nudge downward until it fits; if impossible, leave inactive.
      const adjusted = this.findFirstValidPosition(instance);
      if (!adjusted) {
        this.activeTetromino = null;
        return;
      }
      this.activeTetromino = adjusted;
      return;
    }

    this.activeTetromino = instance;
  }

  private findFirstValidPosition(instance: ActiveTetromino): ActiveTetromino | null {
    const candidate: ActiveTetromino = { ...instance };
    while (candidate.position.y >= 0) {
      if (this.canOccupy(candidate.position, candidate.cells)) {
        return candidate;
      }
      candidate.position = {
        ...candidate.position,
        y: candidate.position.y - 1
      };
    }
    return null;
  }

  private canOccupy(position: FieldCoordinate, cells: readonly FieldCoordinate[]): boolean {
    return cells.every((cell) =>
      this.isWithinBounds({
        x: position.x + cell.x,
        y: position.y + cell.y,
        z: position.z + cell.z
      })
    );
  }

  private getSpawnPosition(definition: TetrominoDefinition): FieldCoordinate {
    const baseX = Math.max(1, Math.floor(this.dimensions.width / 2) - 1);
    const baseZ = Math.max(1, Math.floor(this.dimensions.depth / 2) - 1);
    const baseY = this.dimensions.height - 1;

    const maxOffsets = definition.cells.reduce(
      (acc, cell) => ({
        maxX: Math.max(acc.maxX, cell.x),
        minX: Math.min(acc.minX, cell.x),
        maxZ: Math.max(acc.maxZ, cell.z),
        minZ: Math.min(acc.minZ, cell.z)
      }),
      { maxX: -Infinity, minX: Infinity, maxZ: -Infinity, minZ: Infinity }
    );

    const spawnX = clamp(
      baseX,
      0,
      this.dimensions.width - 1 - maxOffsets.maxX
    );
    const spawnZ = clamp(
      baseZ,
      0,
      this.dimensions.depth - 1 - maxOffsets.maxZ
    );

    const adjustedX = Math.max(spawnX, -maxOffsets.minX);
    const adjustedZ = Math.max(spawnZ, -maxOffsets.minZ);

    return {
      x: adjustedX,
      y: baseY,
      z: adjustedZ
    };
  }

  private dequeueNextType(): TetrominoType {
    if (this.queue.length === 0) {
      this.refillBag();
    }
    const next = this.queue.shift();
    return next ?? getRandomTetrominoType();
  }

  private refillBag(): void {
    const bag = [...TETROMINO_TYPES];
    for (let i = bag.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    this.queue.push(...bag);
  }

  private createEmptyGrid(): CellState[][][] {
    const { width, height, depth } = this.dimensions;
    return Array.from({ length: height }, () =>
      Array.from({ length: width }, () =>
        Array.from({ length: depth }, () => 'empty' as CellState)
      )
    );
  }
}

type RotationDirection = 1 | -1;

interface ActiveTetromino {
  readonly type: TetrominoType;
  readonly color: number;
  position: FieldCoordinate;
  cells: FieldCoordinate[];
}

export interface ActiveTetrominoSnapshot {
  readonly type: TetrominoType;
  readonly color: number;
  readonly blocks: FieldCoordinate[];
}

function rotateCell(
  cell: FieldCoordinate,
  axis: Axis,
  direction: RotationDirection
): FieldCoordinate {
  const { x, y, z } = cell;
  if (axis === 'x') {
    return direction === 1
      ? { x, y: -z, z: y }
      : { x, y: z, z: -y };
  }
  if (axis === 'y') {
    return direction === 1
      ? { x: z, y, z: -x }
      : { x: -z, y, z: x };
  }
  return direction === 1
    ? { x: -y, y: x, z }
    : { x: y, y: -x, z };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
