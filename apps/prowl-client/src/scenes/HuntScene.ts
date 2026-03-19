import { Scene, type Types, Input, GameObjects } from "phaser";
import { Callbacks } from "@colyseus/sdk";
import type { Room } from "@colyseus/sdk";
import { MessageType, PLAYER_SPEED } from "@game-engine/shared";
import type { MatchState } from "@game-engine/state";

interface SpriteTarget {
  rect: GameObjects.Rectangle;
  targetX: number;
  targetY: number;
  lastSeq: number;
}

export class HuntScene extends Scene {
  private room!: Room<MatchState>;
  private cursors!: Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Input.Keyboard.Key>;
  private prevDx = 0;
  private prevDy = 0;
  private sprites = new Map<string, SpriteTarget>();
  private seq = 0;
  private localVx = 0;
  private localVy = 0;

  constructor() {
    super({ key: "HuntScene" });
  }

  create() {
    this.room = this.registry.get("room") as Room<MatchState>;
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey("W"),
      A: this.input.keyboard!.addKey("A"),
      S: this.input.keyboard!.addKey("S"),
      D: this.input.keyboard!.addKey("D"),
    };

    const $ = Callbacks.get(this.room);

    $.onAdd("entities", (entity, sessionId) => {
      const isLocal = sessionId === this.room.sessionId;
      const color = isLocal ? 0x00ff88 : 0xff4444;
      const rect = this.add.rectangle(entity.x, entity.y, 32, 32, color);
      const target: SpriteTarget = {
        rect,
        targetX: entity.x,
        targetY: entity.y,
        lastSeq: entity.lastSeq,
      };
      this.sprites.set(sessionId, target);

      $.listen(entity, "x", (val) => {
        const s = this.sprites.get(sessionId);
        if (s) s.targetX = val;
      });

      $.listen(entity, "y", (val) => {
        const s = this.sprites.get(sessionId);
        if (s) s.targetY = val;
      });

      $.listen(entity, "lastSeq", (val) => {
        const s = this.sprites.get(sessionId);
        if (s) s.lastSeq = val;
      });
    });

    $.onRemove("entities", (_entity, sessionId) => {
      const s = this.sprites.get(sessionId);
      if (s) {
        s.rect.destroy();
        this.sprites.delete(sessionId);
      }
    });
  }

  update(_time: number, delta: number) {
    if (!this.room) return;

    const dt = delta / 1000;

    for (const [sessionId, s] of this.sprites) {
      if (sessionId === this.room.sessionId) {
        // Local player: apply predicted velocity immediately
        s.rect.x += this.localVx * dt;
        s.rect.y += this.localVy * dt;

        // Reconcile toward server position.
        // When server has acked our latest input, any drift is real — correct firmly.
        // When server is behind, drift is expected — correct gently.
        const serverAcked = s.lastSeq >= this.seq - 1;
        const correctionBase = serverAcked ? 0.001 : 0.3;
        const t = 1 - Math.pow(correctionBase, dt);
        s.rect.x += (s.targetX - s.rect.x) * t;
        s.rect.y += (s.targetY - s.rect.y) * t;
      } else {
        // Remote players: frame-rate independent interpolation
        const t = 1 - Math.pow(0.0001, dt);
        s.rect.x += (s.targetX - s.rect.x) * t;
        s.rect.y += (s.targetY - s.rect.y) * t;
      }
    }

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;

    if (dx === this.prevDx && dy === this.prevDy) return;
    this.prevDx = dx;
    this.prevDy = dy;

    // Update local predicted velocity (same normalization as server)
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      this.localVx = (dx / len) * PLAYER_SPEED;
      this.localVy = (dy / len) * PLAYER_SPEED;
    } else {
      this.localVx = 0;
      this.localVy = 0;
    }

    this.room.send(MessageType.Input, {
      seq: this.seq++,
      dx,
      dy,
    });
  }
}
