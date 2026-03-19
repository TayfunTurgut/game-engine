import { query } from "bitecs";
import type { GameWorld } from "./world";

export function movementSystem(world: GameWorld) {
  const dt = world.time.delta;
  const { Position, Velocity } = world.components;
  for (const eid of query(world, [Position, Velocity])) {
    Position.x[eid] += Velocity.x[eid] * dt;
    Position.y[eid] += Velocity.y[eid] * dt;
  }
}
