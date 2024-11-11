export const joinRegex = /^\/join\s+(\w+)?$/;
export const revokeRegex = /^\/revoke\s+(\w+)$/;
export const listRegex = /^\/list$/;
export const cancelRegex = /^\/cancel$/;
export const quitRegex = /^\/quit$/;

export const inviteRegex = /^\/invite\s+([a-zA-Z0-9_]+)$/;

export const usernameRegex = /@[a-zA-Z0-9_]+/g;

export const channelNameRegex = /^[a-zA-Z0-9_]+$/;

export const joinTypeRegex = /^\/join\s+([a-zA-Z0-9_]+)\s+\[(public|private)\]$/;

export const kickRegex = /^\/kick\s+([a-zA-Z0-9_]+)$/;
