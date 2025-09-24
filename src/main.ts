import { GameEngine } from './GameEngine';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) {
  throw new Error('#app コンテナが見つかりませんでした。');
}

const viewport = document.createElement('div');
viewport.style.flex = '1';
viewport.style.position = 'relative';
viewport.style.minHeight = '100%';
root.appendChild(viewport);

const engine = new GameEngine();
engine.start(viewport);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    engine.stop();
  });
}
