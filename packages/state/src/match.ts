import { Schema, type, MapSchema } from "@colyseus/schema";

export class EntityState extends Schema {
  @type("float32") x: number = 0;
  @type("float32") y: number = 0;
  @type("uint32") lastSeq: number = 0;
}

export class MatchState extends Schema {
  @type({ map: EntityState }) entities = new MapSchema<EntityState>();
}
