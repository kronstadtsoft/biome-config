# @kronstadtsoft/biome-config

The shared Biome configuration for every Kronstadtsoft TypeScript project. It holds the formatter
settings, the language settings, and a strict lint preset. It also ships `no-cast.grit`, a GritQL
plugin that bans TypeScript type assertions.

Use Biome 2.5.6 or later. GritQL plugins arrived in Biome 2.0. The `plugins[].includes` field
arrived in Biome 2.5, and this package depends on it.

## Adopt it

Install the package and Biome.

```bash
pnpm add -D @kronstadtsoft/biome-config @biomejs/biome
```

Write this `biome.jsonc` at the root of the repository.

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.6/schema.json",
  "root": true,
  "extends": ["@kronstadtsoft/biome-config/biome"],
  "plugins": ["./node_modules/@kronstadtsoft/biome-config/no-cast.grit"]
}
```

Add the check scripts to `package.json`.

```json
{
  "scripts": {
    "check": "biome check --error-on-warnings .",
    "check:fix": "biome check --write .",
    "check:suppressions": "node scripts/check-suppressions.ts"
  }
}
```

Copy [`scripts/check-suppressions.ts`](scripts/check-suppressions.ts) byte for byte to the same
path in your repository. Give `scripts/**` an `overrides` entry that turns off `noNodejsModules`
and `noConsole`. A path given as an argument is skipped; this repository skips `test/fixtures/`.

Run all three in CI. The section [Ban the blanket forms](#ban-the-blanket-forms-and-every-file-wide-form)
explains the third.

The base sets `vcs.useIgnoreFile: true`, so Biome needs an ignore file. A `.gitignore` supplies one.
So does the `.git/info/exclude` file that `git init` and `git clone` create. Biome stops with
`Biome couldn't find an ignore file` only outside a git repository.

## The consumer declares the plugin path

A plugin path does not resolve across an `extends` boundary. This package cannot declare
`no-cast.grit` for you. Biome resolves the path against the configuration file that declares it, and
it fails to read a path that arrives through `extends`:

```
plugin ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  × Error(s) during loading of plugins:
    Cannot read file.
```

So each repository names the path itself, as the snippet above does. The self-test in this
repository measures both behaviours on every run.

## Exempt code from the plugin

There are three sanctioned forms. Each one names its target, so a reviewer sees what is exempt.

**One line.** Write a suppression comment that names the plugin file stem.

```ts
// biome-ignore lint/plugin/no-cast: the shape comes from a third-party declaration.
const config = raw as Config
```

Biome checks the name against the loaded plugins. A wrong name leaves the plugin reporting and adds
a `suppressions/unused` warning, which `--error-on-warnings` turns into a failure. The form is
precise: on a line that holds a type assertion and a `==`, it suppresses the plugin and leaves
`noDoubleEquals` reporting.

**A range of lines.** Open with `biome-ignore-start` and close with `biome-ignore-end`. Name the
plugin in both comments.

```ts
// biome-ignore-start lint/plugin/no-cast: this block reads a third-party payload.
const config = raw as Config
const limits = raw.limits as Limits
// biome-ignore-end lint/plugin/no-cast: the block ends here.
```

**One file, or a set of files.** Write a negated glob in `plugins[].includes`.

```json
"plugins": [
  { "path": "./node_modules/@kronstadtsoft/biome-config/no-cast.grit", "includes": ["**/*.ts", "!**/env.ts"] }
]
```

These forms were measured on Biome 2.5.6. Two other forms do not suppress the plugin at all:

| Form | Result |
|---|---|
| `// biome-ignore lint/<group>/<rule>: reason` | The plugin still reports, and Biome adds a `suppressions/unused` warning |
| `overrides[].plugins: []` | The plugin still reports |

## Ban the blanket forms, and every file-wide form

A suppression comment that names no rule suppresses the plugin, and every other lint rule with it:

- `// biome-ignore lint: reason` suppresses one line.
- `// biome-ignore-all lint: reason` suppresses the whole file.

Both forms are banned. An author who writes one intends to suppress one rule, and suppresses all of
them. Use `// biome-ignore lint/plugin/no-cast:` instead, which names its target.

Every file-wide form is banned, whatever it names:

- `// biome-ignore-all lint/plugin/no-cast: reason` suppresses the rule in the whole file.
- `// biome-ignore-all format: reason` turns the formatter off for the whole file.
- `// biome-ignore-all assist/source/organizeImports: reason` turns the action off for the whole file.

A named suppression is allowed because a reader sees the rule and the reason beside the code it
covers. A file-wide comment covers code a reader never sees, and covers code added later. Bound it
instead: name the rule on the line, or open a `biome-ignore-start` range and close it.

Biome cannot enforce this ban. Version 2.5.6 has no rule that makes a suppression name its target.
A GritQL plugin cannot enforce it either, because Biome holds comments as trivia and not as nodes.
So every repository runs `scripts/check-suppressions.ts`. The script reads each comment that opens
with a suppression (`//`, `/*` or `<!--`), and fails the run when the comment:

- is a `biome-ignore-all`, in any form;
- is a `biome-ignore`, `biome-ignore-start` or `biome-ignore-end` with a target that is not
  `lint/<group>/<rule>` or `assist/<group>/<action>`. A bare `lint:`, `format:` or `assist:` fails.
  A group alone, such as `lint/plugin:`, fails.

The script reads tracked and untracked files (`git ls-files --cached --others --exclude-standard`),
so a new file fails before its author adds it. It reads every extension Biome processes, not only
`*.ts`. It allows any run of spaces or tabs between the tokens and before the colon, as Biome does.
Biome itself rejects a suppression with no reason and a range end with no start, so the script does
not check those.

## What this package holds, and what your repository holds

The base holds the part that is true of every Kronstadtsoft project.

| Here | In the consuming repository |
|---|---|
| `formatter`, `javascript`, `json`, `css`, `assist`, `vcs` | The `plugins` declaration |
| The whole `linter.rules` preset block, and the rules that no project here can use | Every `overrides` entry |
| The generic `files.includes` exclusions: `node_modules`, `build`, `dist`, `.next`, `.open-next`, `.wrangler`, `.react-router`, the lockfile, the generated Cloudflare declaration files, and `.claude` | Any `files.includes` path that names an app, a route directory, or a generated file of that project |

A rule that fails to apply to one class of files is not a candidate for the base. Turn it off in an
`overrides` entry in the repository that owns those files. The rule then keeps protecting every
other file.

## Adopting the base changes the diagnostics you get

`extends` replaces an array; it does not merge one. It replaces a preset in the same way. Compare
the base against the configuration you have before you adopt it. Keep three classes of setting
declared locally.

**A preset you raised above the base.** The base sets `complexity` to the `recommended` preset, and
declares no `performance` block. A repository that set either group to `all` loses that coverage,
and Biome reports nothing. Any `overrides` entry that turns off a rule from the wider set then has
no rule to turn off.

**A rule you turned off that the base leaves on.** One example is
`correctness.useUniqueElementIds`, turned off where in-page anchor ids must stay stable. Another is
`style.noHexColors`, turned off where a palette is inlined in SVG. Adoption makes `pnpm check` fail
on the first run. Declare each of those rules in the local configuration.

**Your own `files.includes`.** A repository that declares this key replaces the base list. It must
repeat every generic entry it still wants, then add its own.

## Verify a change

```bash
pnpm install
pnpm check
pnpm check:suppressions
pnpm typecheck
pnpm test
```

`pnpm test` runs `test/self-test.ts` with Bun. The script copies the fixtures to a temporary
directory, runs Biome against them, and asserts the exit code and the diagnostic count of each case.
It builds two consumer projects that install this package, to measure the `extends` boundary. It
also runs the `check:suppressions` script against each gate fixture, untracked and staged, in
both directions. CI runs the same commands.
