/**
 * 定義済みのフィールド寸法を表す型。
 */
export interface FieldDimensions {
  /** X軸方向（幅）のセル数 */
  width: number;
  /** Y軸方向（高さ）のセル数 */
  height: number;
  /** Z軸方向（奥行き）のセル数 */
  depth: number;
}

/**
 * レンダリングおよびロジックの両方で使用する 1 セルあたりのワールド座標サイズ。
 */
export const CELL_SIZE = 1;

/**
 * 3D テトリスフィールドの標準寸法。将来のストーリーで共有利用される。
 */
export const FIELD_DIMENSIONS: FieldDimensions = Object.freeze({
  width: 10,
  height: 20,
  depth: 10
});

/**
 * Three.js 空間内でフィールドを原点近くに配置するための基準位置。
 * フィールド中央がシーンの原点付近に来るよう、X/Z 軸で負方向にオフセットする。
 */
export const FIELD_ORIGIN = Object.freeze({
  x: -((FIELD_DIMENSIONS.width * CELL_SIZE) / 2),
  y: 0,
  z: -((FIELD_DIMENSIONS.depth * CELL_SIZE) / 2)
});

export type FieldCoordinate = {
  x: number;
  y: number;
  z: number;
};
