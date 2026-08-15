# biome-config

The public, shared Biome configuration for every Kronstadtsoft TypeScript project. It is published
to npm as `@kronstadtsoft/biome-config`. It carries no application code. It carries a configuration
file and one GritQL plugin.

Read `README.md` for the consumer instructions. This file holds what a contributor needs.

## Shape

| Path | Holds |
|---|---|
| `biome.jsonc` | The shared base. Published, and also the configuration this repository checks itself with |
| `no-cast.grit` | The GritQL plugin that bans TypeScript type assertions. Published |
| `test/self-test.ts` | The self-test runner. Run with Bun, wired as `pnpm test` |
| `test/cases.ts` | The case tables the runner drives |
| `test/configs/` | The three Biome configurations the self-test drives |
| `test/fixtures/` | The TypeScript inputs the self-test measures |
| `test/biome.jsonc` | The nested configuration that lets `test/` hold a Bun program and broken fixtures |

`package.json` publishes only `biome.jsonc` and `no-cast.grit`. Everything else exists to prove
those two files work.

## Two files are public

`biome.jsonc` and `no-cast.grit` go to npm, and `README.md` goes with them. Do not name a private
repository, a private path, or a private script in any of the three. Check this before each release.

## The base stays general

`biome.jsonc` applies to every repository that extends it. Put a setting there only when it is true
of all of them. A rule that fails to apply to one class of files belongs in an `overrides` entry in
the repository that owns those files. Never add an `overrides` entry that names an app, a route
directory, or a generated file of one project.

## Two facts a contributor will otherwise get wrong

**A plugin path does not resolve across `extends`.** A relative path declared inside the published
`biome.jsonc` fails in the consumer with `Error(s) during loading of plugins: Cannot read file.`
The consumer must declare the path. Do not move the `plugins` declaration into the base.

**A suppression comment can turn the plugin off, in five forms.** Three are sanctioned and two are
banned:

| Form | Effect | Status |
|---|---|---|
| `// biome-ignore lint/plugin/no-cast:` | Suppresses this plugin on one line, and nothing else | Sanctioned |
| `// biome-ignore-start lint/plugin/no-cast:` | The same, over a range that `-end` closes | Sanctioned |
| `// biome-ignore lint/plugin:` | Suppresses every plugin on one line | Allowed, less precise |
| `// biome-ignore lint:` | Suppresses every rule on one line | **Banned** |
| `// biome-ignore-all lint:` | Suppresses every rule in the file | **Banned** |

A `biome-ignore` that names a built-in rule does not suppress the plugin. Neither does
`overrides[].plugins: []`. A `lint/plugin/<name>` comment with a wrong name does not suppress
either: Biome checks the name and reports `suppressions/unused`. A blanket
`// biome-ignore-start lint:` does not suppress either.

We measured both facts on Biome 2.5.6, and the self-test asserts every row above. A Biome
upgrade that changes one makes the self-test fail. Fix `README.md` and `CLAUDE.md` in the same
change.

## The blanket ban runs on grep, not on Biome

Biome 2.5.6 has no rule that makes a suppression name its target. A GritQL plugin cannot supply one,
because Biome holds comments as trivia and not as nodes, so no pattern matches a comment. The gate
is `pnpm check:suppressions`, which is a `git grep` for the two banned forms. CI runs it.

The pattern is loose on purpose. Biome accepts any run of spaces or tabs between the tokens and
before the colon, and it lints eight JS-family extensions. A pattern with one literal space, or a
pathspec of `*.ts` and `*.tsx` alone, is defeated by four one-character edits. Write the pattern
once, in `package.json`. The self-test reads that script and runs it, so a weakened script makes
the suite fail.

The gate skips `test/fixtures`, because those files are this repository's record of the banned
forms. It does not skip `test/self-test.ts`. So write a case name there without the literal text
`lint:`, or the gate matches the test that guards it.

## A third fact, about this repository only

A nested Biome configuration file does not chain. `test/biome.jsonc` applies to `test/`, and a
second nested file under `test/fixtures/` is ignored. The fixture rules therefore live in an
`overrides` entry inside `test/biome.jsonc`.

That override turns the linter off for the fixtures, and a nested configuration still applies when
`--config-path` names another file. So the self-test copies the fixtures to a temporary directory
before it runs Biome. Do not point the self-test at the fixtures in place.

## Commands

| | |
| --- | --- |
| `pnpm check` | Biome. `pnpm check:fix` to apply |
| `pnpm check:suppressions` | The grep gate for banned suppression forms |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm test` | The self-test |

CI runs all four, then `git diff --exit-code`.

## Four standard CI gates are absent, by decision

The repository standard lists eight gates. Four do not apply here, and the reason is recorded so that
nobody adds an empty script to satisfy a checklist:

- **Build.** The package ships two files that need no build step.
- **Regenerate artifacts.** No file here is generated, so there is no `types` script. CI still runs
  `git diff --exit-code`, which catches a step that rewrote a committed file.
- **End-to-end.** There is no running system to drive.
- **Accessibility.** The package ships no interface.

## Release

The owner publishes to npm by hand. Bump the version in `package.json` in its own pull request.
Publishing is not automated, and CI holds no npm token.
