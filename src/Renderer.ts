import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
  GridHelper
} from 'three';
import type { ActiveTetrominoSnapshot } from './GameState';
import { GameState } from './GameState';
import { CELL_SIZE, FIELD_DIMENSIONS, FIELD_ORIGIN } from './constants/field';

/**
 * Three.js を用いてゲームフィールドを描画する View 層。
 */
export class Renderer {
  private readonly gameState: GameState;
  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private renderer: WebGLRenderer | null = null;
  private container: HTMLElement | null = null;
  private resizeHandler: (() => void) | null = null;
  private activeTetrominoGroup: Group | null = null;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * 描画に必要な Three.js の初期化処理を行い、即座に 1 フレーム描画する。
   */
  public initialize(container: HTMLElement): void {
    this.container = container;

    const scene = new Scene();
    scene.background = new Color('#0f172a');

    const { width, height, depth } = this.gameState.getDimensions();

    const camera = new PerspectiveCamera(
      50,
      this.getAspectRatio(),
      0.1,
      1000
    );
    const cameraTarget = new Vector3(
      FIELD_ORIGIN.x + (width * CELL_SIZE) / 2,
      (height * CELL_SIZE) / 2,
      FIELD_ORIGIN.z + (depth * CELL_SIZE) / 2
    );
    camera.position.set(
      cameraTarget.x + width * 1.2,
      cameraTarget.y + height * 0.8,
      cameraTarget.z + depth * 1.8
    );
    camera.lookAt(cameraTarget);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(this.createLighting());
    scene.add(this.createFieldBounds());
    scene.add(this.createGridHelper());

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.resizeHandler = () => this.onResize();
    window.addEventListener('resize', this.resizeHandler);

    this.updateActiveTetromino(this.gameState.getActiveTetromino());
    this.renderFrame();
  }

  /**
   * 現在のシーンを 1 フレーム描画する。将来的にゲームループから呼び出される。
   */
  public renderFrame(): void {
    if (!this.scene || !this.camera || !this.renderer) {
      return;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * リサイズ監視や Three.js リソースのクリーンアップを行う。
   */
  public dispose(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    this.renderer?.dispose();
    this.disposeActiveTetrominoGroup();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.container = null;
  }

  public updateActiveTetromino(tetromino: ActiveTetrominoSnapshot | null): void {
    if (!this.scene) {
      return;
    }

    this.disposeActiveTetrominoGroup();

    if (!tetromino) {
      return;
    }

    const group = new Group();
    group.position.set(FIELD_ORIGIN.x, FIELD_ORIGIN.y, FIELD_ORIGIN.z);

    tetromino.blocks.forEach((block) => {
      const geometry = new BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
      const material = new MeshStandardMaterial({
        color: tetromino.color,
        metalness: 0.1,
        roughness: 0.35
      });
      const mesh = new Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.position.set(
        (block.x + 0.5) * CELL_SIZE,
        (block.y + 0.5) * CELL_SIZE,
        (block.z + 0.5) * CELL_SIZE
      );
      group.add(mesh);
    });

    this.activeTetrominoGroup = group;
    this.scene.add(group);
    this.renderFrame();
  }

  /**
   * Construct floor, walls, ceiling, and a translucent wireframe to visualize the playable volume.
   */
  private createFieldBounds(): Group {
    const group = new Group();
    group.position.set(FIELD_ORIGIN.x, FIELD_ORIGIN.y, FIELD_ORIGIN.z);

    const { width, height, depth } = this.gameState.getDimensions();

    const floorMaterial = new MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.1,
      roughness: 0.8
    });
    const wallMaterial = new MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.05,
      roughness: 0.7,
      transparent: true,
      opacity: 0.9
    });
    const ceilingMaterial = wallMaterial.clone();
    ceilingMaterial.opacity = 0.35;

    const boundsMaterial = new LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45
    });

    const floor = new Mesh(
      new PlaneGeometry(width * CELL_SIZE, depth * CELL_SIZE),
      floorMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.position.set(
      (width * CELL_SIZE) / 2,
      0,
      (depth * CELL_SIZE) / 2
    );

    const ceiling = new Mesh(
      new PlaneGeometry(width * CELL_SIZE, depth * CELL_SIZE),
      ceilingMaterial
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(
      (width * CELL_SIZE) / 2,
      height * CELL_SIZE,
      (depth * CELL_SIZE) / 2
    );

    const leftWall = new Mesh(
      new PlaneGeometry(depth * CELL_SIZE, height * CELL_SIZE),
      wallMaterial
    );
    leftWall.position.set(0, (height * CELL_SIZE) / 2, (depth * CELL_SIZE) / 2);
    leftWall.rotation.y = Math.PI / 2;

    const rightWall = leftWall.clone();
    rightWall.position.set(width * CELL_SIZE, (height * CELL_SIZE) / 2, (depth * CELL_SIZE) / 2);
    rightWall.rotation.y = -Math.PI / 2;

    const backWall = new Mesh(
      new PlaneGeometry(width * CELL_SIZE, height * CELL_SIZE),
      wallMaterial
    );
    backWall.position.set(
      (width * CELL_SIZE) / 2,
      (height * CELL_SIZE) / 2,
      depth * CELL_SIZE
    );
    backWall.rotation.y = Math.PI;

    const boundsGeometry = new BoxGeometry(
      width * CELL_SIZE,
      height * CELL_SIZE,
      depth * CELL_SIZE
    );
    boundsGeometry.translate(
      (width * CELL_SIZE) / 2,
      (height * CELL_SIZE) / 2,
      (depth * CELL_SIZE) / 2
    );
    const bounds = new LineSegments(new EdgesGeometry(boundsGeometry), boundsMaterial);

    group.add(floor, ceiling, leftWall, rightWall, backWall, bounds);

    return group;
  }

  private createLighting(): Group {
    const group = new Group();

    const ambient = new AmbientLight(0xf1f5f9, 0.35);

    const directional = new DirectionalLight(0xf8fafc, 0.8);
    directional.position.set(10, 18, 12);
    directional.castShadow = true;

    group.add(ambient, directional);
    return group;
  }

  private createGridHelper(): GridHelper {
    const { width, depth } = FIELD_DIMENSIONS;
    const helper = new GridHelper(
      Math.max(width, depth) * CELL_SIZE,
      Math.max(width, depth),
      0x38bdf8,
      0x1e293b
    );
    helper.position.set(
      FIELD_ORIGIN.x + (width * CELL_SIZE) / 2,
      FIELD_ORIGIN.y + 0.001,
      FIELD_ORIGIN.z + (depth * CELL_SIZE) / 2
    );
    return helper;
  }

  private onResize(): void {
    if (!this.camera || !this.renderer) {
      return;
    }

    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();

    const width = this.container?.clientWidth ?? window.innerWidth;
    const height = this.container?.clientHeight ?? window.innerHeight;
    this.renderer.setSize(width, height);
    this.renderFrame();
  }

  private getAspectRatio(): number {
    const width = this.container?.clientWidth ?? window.innerWidth;
    const height = this.container?.clientHeight ?? window.innerHeight;
    return width / height;
  }

  private disposeActiveTetrominoGroup(): void {
    if (!this.scene || !this.activeTetrominoGroup) {
      return;
    }

    this.activeTetrominoGroup.children.forEach((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    this.scene.remove(this.activeTetrominoGroup);
    this.activeTetrominoGroup = null;
  }
}
