const payload: unknown = JSON.parse('{"id":"1"}')

// biome-ignore lint/plugin/no-such-plugin: Biome checks the name against the loaded plugins.
export const record = payload as Record<string, string>
