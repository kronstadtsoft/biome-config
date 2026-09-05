#!/usr/bin/env bun
// GENERATED — DO NOT EDIT HERE. Source: kronstadtsoft/rules · claude/hooks/block-hook-bypass.ts (rule set v2.1.0)
// Change the source there and run: bun run scripts/apply.ts --target <this repo>

type PreToolUse = {
  tool_name?: string;
  tool_input?: { command?: string };
};

const raw = await Bun.stdin.text();

let payload: PreToolUse;
try {
  payload = JSON.parse(raw) as PreToolUse;
} catch {
  process.exit(0);
}

if (payload.tool_name !== "Bash") process.exit(0);

const command = payload.tool_input?.command ?? "";

const BYPASSES: { pattern: RegExp; what: string }[] = [
  { pattern: /--no-verify\b/, what: "--no-verify" },
  { pattern: /\bgit\s+(?:-\S+\s+)*commit\b[^\n;&|]*\s-n\b/, what: "git commit -n (short for --no-verify)" },
  { pattern: /core\.hooksPath\s*=/, what: "core.hooksPath override" },
  { pattern: /\bHUSKY\s*=\s*0\b/, what: "HUSKY=0" },
];

const hit = BYPASSES.find((b) => b.pattern.test(command));
if (!hit) process.exit(0);

console.error(
  [
    `Blocked: ${hit.what} disables the git hooks.`,
    "",
    "The pre-push hook is what enforces two rules in .claude/rules/kfi-workflow.md:",
    "  · no direct push to main",
    "  · every branch names its Linear ticket (alexandruadam/kfi-<n>-<slug>)",
    "",
    "If the push was rejected, the fix is the branch or the ticket, not the flag:",
    "  · no ticket yet      → create one, then rename the branch to match",
    "  · wrong branch name  → git branch -m alexandruadam/kfi-<n>-<slug>",
    "  · pushing to main    → open a pull request",
    "",
    "A genuine emergency is a decision, not a keystroke. Ask the administrator to run it,",
    "and record why in the QMS.",
  ].join("\n"),
);

process.exit(2);
