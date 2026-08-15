const payload: unknown = JSON.parse('{"id":"1"}')

// biome-ignore lint: a blanket suppression silences the plugin, and everything else on this line.
export const record = payload as Record<string, string>
