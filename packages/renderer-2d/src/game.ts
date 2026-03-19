import { Scene, Game, AUTO, Scale } from "phaser";

export interface GameConfig {
  parent: string | HTMLElement;
  width: number;
  height: number;
  scenes: (typeof Scene)[];
}

export function createPhaserGame(config: GameConfig) {
  return new Game({
    type: AUTO,
    width: config.width,
    height: config.height,
    parent: config.parent,
    pixelArt: true,
    backgroundColor: "#111111",
    scene: config.scenes,
    scale: {
      mode: Scale.FIT,
      autoCenter: Scale.CENTER_BOTH,
    },
  });
}
