const payload: unknown = JSON.parse('{"id":"1"}')

// biome-ignore lint/plugin: the group form suppresses every plugin on this line.
export const record = payload as Record<string, string>
