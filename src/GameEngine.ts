import { GameState } from './GameState';
import { Renderer } from './Renderer';

/**
 * ゲームループと主要コンポーネントのライフサイクルを管理するクラス。
 */
export class GameEngine {
  private readonly state: GameState;
  private readonly renderer: Renderer;
  private animationFrameId: number | null = null;

  constructor(state: GameState = new GameState(), renderer?: Renderer) {
    this.state = state;
    this.renderer = renderer ?? new Renderer(this.state);
  }

  /**
   * 指定したコンテナに Three.js のキャンバスを初期化し、レンダリングループを開始する。
   */
  public start(container: HTMLElement): void {
    this.renderer.initialize(container);
    this.beginRenderLoop();
  }

  /**
   * レンダリングループを停止し、各種リソースを解放する。
   */
  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.renderer.dispose();
  }

  /**
   * GameState インスタンスへの読み取りアクセスを提供する。
   */
  public getState(): GameState {
    return this.state;
  }

  /**
   * Renderer インスタンスを取得する。テストやデバッグ用。
   */
  public getRenderer(): Renderer {
    return this.renderer;
  }

  private beginRenderLoop(): void {
    const loop = () => {
      this.renderer.renderFrame();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }
}
