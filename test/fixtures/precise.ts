const payload: unknown = JSON.parse('{"id":"1"}')

// biome-ignore lint/plugin/no-cast: the plugin only; `noDoubleEquals` must still report.
export const same = (payload as string) == '1'
