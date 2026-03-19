import { Room, type Client } from "colyseus";
import {
  TICK_INTERVAL_MS,
  PLAYER_SPEED,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  MessageType,
} from "@game-engine/shared";
import type { InputPayload } from "@game-engine/shared";
import {
  createGameWorld,
  deleteEntity,
  movementSystem,
  createMovableEntity,
} from "@game-engine/ecs";
import type { GameWorld } from "@game-engine/ecs";
import { createPhysicsWorld } from "@game-engine/physics";
import type { PhysicsWorld } from "@game-engine/physics";
import { MatchState, EntityState } from "@game-engine/state";

export class MatchRoom extends Room {
  state = new MatchState();

  private ecsWorld!: GameWorld;
  private physicsWorld!: PhysicsWorld;
  private sessionToEid = new Map<string, number>();

  onCreate() {
    this.physicsWorld = createPhysicsWorld();
    this.ecsWorld = createGameWorld();

    this.patchRate = TICK_INTERVAL_MS;

    this.onMessage(MessageType.Input, (client: Client, input: InputPayload) => {
      this.handleInput(client.sessionId, input);
    });

    this.setSimulationInterval(() => this.tick(), TICK_INTERVAL_MS);
    console.log("[MatchRoom] created");
  }

  onJoin(client: Client) {
    const eid = createMovableEntity(this.ecsWorld, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    this.sessionToEid.set(client.sessionId, eid);

    const { Position } = this.ecsWorld.components;

    const entityState = new EntityState();
    entityState.x = Position.x[eid];
    entityState.y = Position.y[eid];
    this.state.entities.set(client.sessionId, entityState);

    console.log(`[MatchRoom] ${client.sessionId} joined, eid=${eid}`);
  }

  onLeave(client: Client) {
    const eid = this.sessionToEid.get(client.sessionId);
    if (eid !== undefined) {
      deleteEntity(this.ecsWorld, eid);
      this.sessionToEid.delete(client.sessionId);
    }
    this.state.entities.delete(client.sessionId);
    console.log(`[MatchRoom] ${client.sessionId} left`);
  }

  private handleInput(sessionId: string, input: InputPayload) {
    const eid = this.sessionToEid.get(sessionId);
    if (eid === undefined) return;
    const { Velocity } = this.ecsWorld.components;

    const len = Math.sqrt(input.dx * input.dx + input.dy * input.dy);
    if (len > 0) {
      Velocity.x[eid] = (input.dx / len) * PLAYER_SPEED;
      Velocity.y[eid] = (input.dy / len) * PLAYER_SPEED;
    } else {
      Velocity.x[eid] = 0;
      Velocity.y[eid] = 0;
    }

    const entityState = this.state.entities.get(sessionId);
    if (entityState) {
      entityState.lastSeq = input.seq;
    }
  }

  private tick() {
    const dt = TICK_INTERVAL_MS / 1000;
    this.ecsWorld.time.delta = dt;
    this.ecsWorld.time.elapsed += dt;

    movementSystem(this.ecsWorld);

    const { Position } = this.ecsWorld.components;

    for (const [sessionId, eid] of this.sessionToEid) {
      const entityState = this.state.entities.get(sessionId);
      if (entityState) {
        entityState.x = Position.x[eid];
        entityState.y = Position.y[eid];
      }
    }

    this.physicsWorld.step();
  }
}
