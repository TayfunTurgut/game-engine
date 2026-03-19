import RAPIER from "@dimforge/rapier2d-compat";

export type PhysicsWorld = RAPIER.World;

export async function initPhysics() {
  await RAPIER.init();
}

export function createPhysicsWorld(): PhysicsWorld {
  return new RAPIER.World({ x: 0, y: 0 });
}
