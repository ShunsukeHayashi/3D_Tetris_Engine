import type { FieldCoordinate, FieldDimensions } from './constants/field';
import { FIELD_DIMENSIONS } from './constants/field';

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

  private createEmptyGrid(): CellState[][][] {
    const { width, height, depth } = this.dimensions;
    return Array.from({ length: height }, () =>
      Array.from({ length: width }, () =>
        Array.from({ length: depth }, () => 'empty' as CellState)
      )
    );
  }
}
