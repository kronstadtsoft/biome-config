const payload: unknown = JSON.parse('{"id":"1"}')

// biome-ignore lint/plugin/no-cast: the sanctioned line-level form names the plugin file.
export const record = payload as Record<string, string>
