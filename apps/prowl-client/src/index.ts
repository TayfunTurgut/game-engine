import { WORLD_WIDTH, WORLD_HEIGHT } from "@game-engine/shared";
import { createGameWorld } from "@game-engine/ecs";
import { initPhysics, createPhysicsWorld } from "@game-engine/physics";
import { createPhaserGame } from "@game-engine/renderer-2d";
import { createClient } from "@game-engine/networking";
import { BootScene } from "./scenes/BootScene";
import { HuntScene } from "./scenes/HuntScene";

async function boot() {
  await initPhysics();
  const physicsWorld = createPhysicsWorld();
  const ecsWorld = createGameWorld();
  const client = createClient();

  const game = createPhaserGame({
    parent: "game",
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    scenes: [BootScene, HuntScene],
  });

  game.registry.set("physicsWorld", physicsWorld);
  game.registry.set("ecsWorld", ecsWorld);
  game.registry.set("colyseusClient", client);
}

void boot();
