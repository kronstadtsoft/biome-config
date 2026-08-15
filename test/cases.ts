const PLUGIN_ON = 'test/configs/plugin-on.jsonc'
const PLUGIN_SCOPED = 'test/configs/plugin-scoped.jsonc'
const PLUGIN_AND_RULE = 'test/configs/plugin-and-rule.jsonc'

interface Expectation {
  name: string
  cwd: string
  args: string[]
  exitCode: number
  hits: number
  contains: string
}

function plugin(config: string, fixture: string): Pick<Expectation, 'cwd' | 'args'> {
  return { cwd: '.', args: ['check', `--config-path=${config}`, fixture] }
}

const cases: Expectation[] = [
  {
    name: 'a type assertion fails the check',
    ...plugin(PLUGIN_ON, 'test/fixtures/has-cast.ts'),
    exitCode: 1,
    hits: 1,
    contains: '',
  },
  {
    name: 'a file with no type assertion passes',
    ...plugin(PLUGIN_ON, 'test/fixtures/clean.ts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: '`as unknown as T` reports both halves',
    ...plugin(PLUGIN_ON, 'test/fixtures/double-cast.ts'),
    exitCode: 1,
    hits: 2,
    contains: '',
  },
  {
    name: 'a negated `plugins[].includes` glob exempts the file',
    ...plugin(PLUGIN_SCOPED, 'test/fixtures/env.ts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: 'the same glob still reports every other file',
    ...plugin(PLUGIN_SCOPED, 'test/fixtures/has-cast.ts'),
    exitCode: 1,
    hits: 1,
    contains: '',
  },
  {
    name: '`lint/plugin/no-cast` suppresses the plugin',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-plugin-named.ts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: 'a wrong plugin name does not suppress, and is reported as unused',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-plugin-wrong.ts'),
    exitCode: 1,
    hits: 1,
    contains: 'suppressions/unused',
  },
  {
    name: '`lint/plugin` suppresses the whole plugin group',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-plugin-group.ts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: '`lint/plugin/no-cast` leaves every other rule on the line reporting',
    ...plugin(PLUGIN_AND_RULE, 'test/fixtures/precise.ts'),
    exitCode: 1,
    hits: 0,
    contains: 'lint/suspicious/noDoubleEquals',
  },
  {
    name: 'a `biome-ignore` naming a built-in rule does not suppress the plugin',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-scoped.ts'),
    exitCode: 1,
    hits: 1,
    contains: '',
  },
  {
    name: 'a blanket `biome-ignore lint` with no rule named suppresses the plugin',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-blanket.ts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: 'a blanket `biome-ignore-all lint` suppresses the whole file',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-all-blanket.ts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: 'a named `biome-ignore-all lint/plugin/no-cast` suppresses the whole file too',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-all-named.ts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: 'several spaces between the tokens still suppress',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-spaces.ts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: 'tabs between the tokens still suppress',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-tabs.ts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: 'a space before the colon still suppresses',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-space-colon.ts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: 'a blanket form suppresses in `.mts` too',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-blanket.mts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: 'a named `biome-ignore-start` range suppresses the plugin',
    ...plugin(PLUGIN_ON, 'test/fixtures/suppressed-range-named.ts'),
    exitCode: 0,
    hits: 0,
    contains: '',
  },
  {
    name: 'a consumer extends the package and declares the plugin path',
    cwd: 'consumer-declares',
    args: ['check', '--error-on-warnings', 'src/app.ts'],
    exitCode: 1,
    hits: 1,
    contains: '',
  },
  {
    name: 'a plugin path inside the extended package cannot be read',
    cwd: 'consumer-inherits',
    args: ['check', '--error-on-warnings', 'src/app.ts'],
    exitCode: 1,
    hits: 0,
    contains: 'Cannot read file.',
  },
]

interface GateExpectation {
  name: string
  fixture: string
  caught: boolean
}

const gateCases: GateExpectation[] = [
  { name: 'the gate catches one space', fixture: 'suppressed-blanket.ts', caught: true },
  { name: 'the gate catches several spaces', fixture: 'suppressed-spaces.ts', caught: true },
  { name: 'the gate catches tabs', fixture: 'suppressed-tabs.ts', caught: true },
  {
    name: 'the gate catches a space before the colon',
    fixture: 'suppressed-space-colon.ts',
    caught: true,
  },
  { name: 'the gate catches the file form', fixture: 'suppressed-all-blanket.ts', caught: true },
  {
    name: 'the gate catches a named file form, which silences as much as a blanket one',
    fixture: 'suppressed-all-named.ts',
    caught: true,
  },
  {
    name: 'the gate catches a blanket form in `.mts`',
    fixture: 'suppressed-blanket.mts',
    caught: true,
  },
  {
    name: 'the gate catches a blanket form in `.css`, which Biome lints too',
    fixture: 'suppressed-blanket.css',
    caught: true,
  },
  {
    name: 'the gate passes `lint/plugin/no-cast`',
    fixture: 'suppressed-plugin-named.ts',
    caught: false,
  },
  { name: 'the gate passes `lint/plugin`', fixture: 'suppressed-plugin-group.ts', caught: false },
  { name: 'the gate passes a built-in rule name', fixture: 'suppressed-scoped.ts', caught: false },
  { name: 'the gate passes a named range', fixture: 'suppressed-range-named.ts', caught: false },
  { name: 'the gate passes a file with no suppression', fixture: 'has-cast.ts', caught: false },
]

export type { Expectation, GateExpectation }
export { cases, gateCases }
