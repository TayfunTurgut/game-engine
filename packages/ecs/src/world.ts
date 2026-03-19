import { createWorld } from "bitecs";
import { Position, Velocity } from "./components";

export function createGameWorld() {
  return createWorld({
    components: { Position: Position(), Velocity: Velocity() },
    time: { delta: 0, elapsed: 0 },
  });
}

export type GameWorld = ReturnType<typeof createGameWorld>;
