const MAX_ENTITIES = 512;

export const Position = () => ({
  x: new Float32Array(MAX_ENTITIES),
  y: new Float32Array(MAX_ENTITIES),
});
export type Position = ReturnType<typeof Position>;

export const Velocity = () => ({
  x: new Float32Array(MAX_ENTITIES),
  y: new Float32Array(MAX_ENTITIES),
});
export type Velocity = ReturnType<typeof Velocity>;
