import { Client } from "@colyseus/sdk";
import type { Schema } from "@colyseus/schema";

export function createClient(url: string = `ws://${window.location.hostname}:2567`) {
  return new Client(url);
}

export async function joinMatch<T extends Schema>(client: Client, schema?: new () => T) {
  return schema ? client.joinOrCreate<T>("match", {}, schema) : client.joinOrCreate<T>("match");
}
