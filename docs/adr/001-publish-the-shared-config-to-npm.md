# ADR-001 — Publish the shared Biome configuration to npm

**Status:** Accepted (15 Aug 2026)
**Context owners:** Alexandru Adam

The organisational decision is recorded in the internal quality system. This record holds the part a
public reader of this repository needs.

## Context

Several Kronstadtsoft repositories held the same Biome configuration as separate copies. The
formatter block, the language blocks, the `assist` block, the `vcs` block, and the whole
`linter.rules` preset block were identical in each. Only the `overrides` array and a few
`files.includes` paths differed, and those name apps and generated files of one project.

The copies had drifted. They ran two different Biome versions, and one copy had raised two rule
groups that the others had not. A rule added to one copy reached the others only by hand.

We also wanted a rule that Biome has no built-in for: a ban on TypeScript type assertions. Biome 2.0
added GritQL plugins, so the rule can be written once as a `.grit` file. Each repository needs the
plugin file.

## Decision

Publish the shared base and the plugin as a public npm package, `@kronstadtsoft/biome-config`. Each
repository extends the package and declares the plugin path itself.

Publish under a public scope. A lint rule set holds nothing confidential, and a private registry
would add an authentication step to every clone and every CI run.

## Consequences

The package name `@kronstadtsoft/biome-config` and the export path `./biome` are now a public
interface. A rename breaks every consumer, so treat both as fixed.

A rule change is now a release, not an edit. The change lands here, gets a version, and each
repository upgrades in its own pull request. This is slower than editing several files, and that is
the intent: each upgrade is a reviewed change with a CI verdict behind it.

The package cannot declare the plugin path for the consumer. Biome does not resolve a plugin path across an
`extends` boundary, so every consumer repeats the path in its own `biome.jsonc`. The self-test in
this repository measures that behaviour, so a Biome release that changes it is visible.

Adoption changes the diagnostics a repository gets. `extends` merges, measured on Biome 2.5.6: a
child's `files.includes` entries add to the base list rather than replacing it, and a child's rule
settings override the base rule by rule, leaving each rule the child does not name in force. A
repository that raised a preset above the base, or turned off a rule the base leaves on, keeps
those settings by declaring them locally. `README.md` states what to check.

Publishing is a manual act by the owner. CI holds no npm token, so a compromised workflow cannot
publish the rule set that formats many files.
