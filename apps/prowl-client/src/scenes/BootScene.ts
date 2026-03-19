import { Scene } from "phaser";
import { joinMatch } from "@game-engine/networking";
import type { Client } from "@colyseus/sdk";
import { MatchState } from "@game-engine/state";

export class BootScene extends Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create() {
    const client = this.registry.get("colyseusClient") as Client;

    joinMatch(client, MatchState)
      .then((room) => {
        this.registry.set("room", room);
        this.scene.start("HuntScene");
      })
      .catch((err) => {
        console.error("Failed to join:", err);
      });
  }
}
