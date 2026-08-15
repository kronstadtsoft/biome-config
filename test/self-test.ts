import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cases, type Expectation, gateCases } from './cases.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const biome = join(root, 'node_modules', '.bin', 'biome')

const MESSAGE = 'Type assertions are banned.'

// The gate is read from package.json and run as written. A second copy of the pattern here would
// let somebody weaken the script and keep the suite green.
const manifest: { scripts: Record<string, string | undefined> } = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8'),
)
const declared = manifest.scripts['check:suppressions']

if (declared === undefined) {
  throw new Error('package.json declares no `check:suppressions` script')
}

const GATE: string = declared

// The fixtures are copied out of the repository before Biome sees them. In place they sit under
// `test/biome.jsonc`, which turns the linter off for them, and a nested configuration file still
// applies when `--config-path` names another file. The copy keeps the paths the configs expect.
const sandbox = mkdtempSync(join(tmpdir(), 'biome-config-'))
cpSync(join(root, 'no-cast.grit'), join(sandbox, 'no-cast.grit'))
cpSync(join(root, 'test', 'configs'), join(sandbox, 'test', 'configs'), { recursive: true })
cpSync(join(root, 'test', 'fixtures'), join(sandbox, 'test', 'fixtures'), { recursive: true })

const CAST = 'const payload: unknown = 1\n\nexport const record = payload as string\n'

function installPackage(consumer: string, config: string): void {
  const installed = join(sandbox, consumer, 'node_modules', '@kronstadtsoft', 'biome-config')
  mkdirSync(installed, { recursive: true })
  cpSync(join(root, 'no-cast.grit'), join(installed, 'no-cast.grit'))
  writeFileSync(join(installed, 'biome.jsonc'), config)
  writeFileSync(
    join(installed, 'package.json'),
    JSON.stringify({
      name: '@kronstadtsoft/biome-config',
      version: '0.0.0',
      exports: { './biome': './biome.jsonc' },
    }),
  )
  mkdirSync(join(sandbox, consumer, 'src'), { recursive: true })
  writeFileSync(join(sandbox, consumer, 'src', 'app.ts'), CAST)
  writeFileSync(join(sandbox, consumer, '.gitignore'), 'node_modules/\n')
}

installPackage('consumer-declares', readFileSync(join(root, 'biome.jsonc'), 'utf8'))
writeFileSync(
  join(sandbox, 'consumer-declares', 'biome.jsonc'),
  `${JSON.stringify(
    {
      root: true,
      extends: ['@kronstadtsoft/biome-config/biome'],
      plugins: ['./node_modules/@kronstadtsoft/biome-config/no-cast.grit'],
    },
    null,
    2,
  )}\n`,
)

installPackage(
  'consumer-inherits',
  `${JSON.stringify({ plugins: ['./no-cast.grit'], linter: { enabled: true, rules: { preset: 'none' } } }, null, 2)}\n`,
)
writeFileSync(
  join(sandbox, 'consumer-inherits', 'biome.jsonc'),
  `${JSON.stringify({ root: true, extends: ['@kronstadtsoft/biome-config/biome'] }, null, 2)}\n`,
)

function run(expected: Expectation): { exitCode: number; hits: number; output: string } {
  const result = spawnSync(biome, expected.args, {
    cwd: join(sandbox, expected.cwd),
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  return { exitCode: result.status ?? -1, hits: output.split(MESSAGE).length - 1, output }
}

const version = spawnSync(biome, ['--version'], { encoding: 'utf8' }).stdout.trim()
console.log(`Biome ${version}\n`)

let failed = 0

for (const expected of cases) {
  const actual = run(expected)
  const ok =
    actual.exitCode === expected.exitCode &&
    actual.hits === expected.hits &&
    actual.output.includes(expected.contains)

  if (ok) {
    console.log(`  PASS  ${expected.name}`)
  } else {
    failed += 1
    console.log(`  FAIL  ${expected.name}`)
    console.log(`        in       ${expected.cwd}`)
    console.log(`        command  biome ${expected.args.join(' ')}`)
    console.log(`        expected exit ${expected.exitCode}, ${expected.hits} diagnostic(s)`)
    console.log(`        got      exit ${actual.exitCode}, ${actual.hits} diagnostic(s)`)
    console.log(actual.output)
  }
}

// The gate runs as the shell command package.json declares, inside a throwaway git repository.
// `git grep` reads tracked files only, so the fixture is staged first. The fixture goes to `src/`
// because the real script excludes `test/fixtures`, where these banned forms are kept on purpose.
function runGate(fixture: string): number {
  const repo = mkdtempSync(join(tmpdir(), 'biome-gate-'))
  mkdirSync(join(repo, 'src'))
  cpSync(join(root, 'test', 'fixtures', fixture), join(repo, 'src', fixture))
  spawnSync('git', ['init', '-q'], { cwd: repo })
  spawnSync('git', ['add', '-N', '.'], { cwd: repo })
  const result = spawnSync('sh', ['-c', GATE], { cwd: repo, encoding: 'utf8' })
  rmSync(repo, { recursive: true, force: true })
  return result.status ?? -1
}

for (const expected of gateCases) {
  const exitCode = runGate(expected.fixture)
  const wanted = expected.caught ? 1 : 0

  if (exitCode === wanted) {
    console.log(`  PASS  ${expected.name}`)
  } else {
    failed += 1
    console.log(`  FAIL  ${expected.name}`)
    console.log(`        fixture  ${expected.fixture}`)
    console.log(`        expected the gate to ${expected.caught ? 'fail' : 'pass'}`)
    console.log(`        got      exit ${exitCode}`)
  }
}

rmSync(sandbox, { recursive: true, force: true })

const total = cases.length + gateCases.length
console.log(`\n${total - failed}/${total} passed.`)
process.exitCode = failed === 0 ? 0 : 1
