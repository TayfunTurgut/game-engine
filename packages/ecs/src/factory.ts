import { addEntity, addComponent, removeEntity } from "bitecs";
import type { GameWorld } from "./world";

export function createEntity(world: GameWorld) {
  return addEntity(world);
}

export function createMovableEntity(world: GameWorld, x: number, y: number) {
  const eid = createEntity(world);
  addComponent(world, eid, world.components.Position);
  addComponent(world, eid, world.components.Velocity);
  world.components.Position.x[eid] = x;
  world.components.Position.y[eid] = y;
  world.components.Velocity.x[eid] = 0;
  world.components.Velocity.y[eid] = 0;
  return eid;
}

export function deleteEntity(world: GameWorld, eid: number) {
  const { Position, Velocity } = world.components;
  Position.x[eid] = 0;
  Position.y[eid] = 0;
  Velocity.x[eid] = 0;
  Velocity.y[eid] = 0;
  removeEntity(world, eid);
}
