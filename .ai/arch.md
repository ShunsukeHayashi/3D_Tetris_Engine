# アーキテクチャ設計書: 3D Tetris Engine

## 1. 技術スタック

-   **言語**: TypeScript
-   **3Dレンダリング**: Three.js
-   **ビルドツール**: Vite
-   **UIフレームワーク**: (オプション) Svelte
-   **物理エンジン**: (オプション) Cannon.js

## 2. システムアーキテクチャ

このプロジェクトは、Model-View-Controller (MVC) パターンに似た、関心事の分離を重視したコンポーネントベースのアーキテクチャを採用する。

-   **GameEngine (Controller)**
    -   ゲームのメインループを管理する。
    -   ユーザー入力を処理し、ゲームの状態を更新する。
    -   `GameState` と `Renderer` を協調させる。

-   **GameState (Model)**
    -   ゲームボードの状態、現在のテトリミノ、スコア、レベルなど、すべてのゲームデータを保持する。
    -   ゲームロジック（衝突検知、ライン消去など）の責務を持つ。

-   **Renderer (View)**
    -   Three.jsを利用して、`GameState` に基づいて3Dシーンをレンダリングする。
    -   カメラ、ライト、オブジェクト（ゲームボード、テトリミノ）の描画を担当する。

## 3. 初期ファイル構造

/
├── .ai/
│   ├── arch.md
│   └── prd.md
├── docs/
├── src/
│   ├── main.ts
│   ├── GameEngine.ts
│   ├── GameState.ts
│   └── Renderer.ts
├── index.html
├── package.json
└── tsconfig.json

