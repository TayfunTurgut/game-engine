import { defineServer, defineRoom } from "colyseus";
import { initPhysics } from "@game-engine/physics";
import { MatchRoom } from "./rooms/MatchRoom";

async function boot() {
  await initPhysics();
  const server = defineServer({
    rooms: {
      match: defineRoom(MatchRoom),
    },
  });
  const port = Number(process.env.PORT) || 2567;
  await server.listen(port);
  console.log(`[prowl-server] listening on ws://localhost:${port}`);
}

void boot();
