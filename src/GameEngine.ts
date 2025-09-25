import type { FieldCoordinate } from './constants/field';
import type { Axis } from './types/coordinates';
import { GameState } from './GameState';
import { Renderer } from './Renderer';

/**
 * ゲームループと主要コンポーネントのライフサイクルを管理するクラス。
 */
export class GameEngine {
  private readonly state: GameState;
  private readonly renderer: Renderer;
  private animationFrameId: number | null = null;
  private keydownHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor(state: GameState = new GameState(), renderer?: Renderer) {
    this.state = state;
    this.renderer = renderer ?? new Renderer(this.state);
  }

  /**
   * 指定したコンテナに Three.js のキャンバスを初期化し、レンダリングループを開始する。
   */
  public start(container: HTMLElement): void {
    this.state.ensureActiveTetromino();
    this.renderer.initialize(container);
    this.syncActiveTetromino();
    this.attachInputHandlers();
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

    this.detachInputHandlers();
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

  private attachInputHandlers(): void {
    if (this.keydownHandler) {
      return;
    }
    this.keydownHandler = (event: KeyboardEvent) => this.handleKeyDown(event);
    window.addEventListener('keydown', this.keydownHandler);
  }

  private detachInputHandlers(): void {
    if (!this.keydownHandler) {
      return;
    }
    window.removeEventListener('keydown', this.keydownHandler);
    this.keydownHandler = null;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const move = MOVEMENT_OFFSETS[event.code];
    if (move) {
      event.preventDefault();
      if (this.state.moveActiveTetromino(move)) {
        this.syncActiveTetromino();
      }
      return;
    }

    const rotation = ROTATION_COMMANDS[event.code];
    if (rotation) {
      event.preventDefault();
      if (this.state.rotateActiveTetromino(rotation.axis, rotation.direction)) {
        this.syncActiveTetromino();
      }
    }
  }

  private syncActiveTetromino(): void {
    this.renderer.updateActiveTetromino(this.state.getActiveTetromino());
  }
}

type RotationCommand = {
  axis: Axis;
  direction: RotationDirection;
};

type RotationDirection = 1 | -1;

const MOVEMENT_OFFSETS: Record<string, FieldCoordinate> = {
  ArrowLeft: { x: -1, y: 0, z: 0 },
  ArrowRight: { x: 1, y: 0, z: 0 },
  ArrowUp: { x: 0, y: 0, z: -1 },
  ArrowDown: { x: 0, y: 0, z: 1 },
  KeyW: { x: 0, y: 1, z: 0 },
  KeyS: { x: 0, y: -1, z: 0 }
};

const ROTATION_COMMANDS: Record<string, RotationCommand> = {
  KeyQ: { axis: 'y', direction: -1 },
  KeyE: { axis: 'y', direction: 1 },
  KeyA: { axis: 'z', direction: -1 },
  KeyD: { axis: 'z', direction: 1 },
  KeyZ: { axis: 'x', direction: -1 },
  KeyX: { axis: 'x', direction: 1 }
};
