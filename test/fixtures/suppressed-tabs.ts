const payload: unknown = JSON.parse('{"id":"1"}')

//	biome-ignore	lint:	tabs between the tokens.
export const record = payload as Record<string, string>
