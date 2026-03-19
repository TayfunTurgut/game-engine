export const MessageType = {
  Input: 0,
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];
