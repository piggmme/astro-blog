---
title: 'Making AI Agents Work by Team Rules'
pubDate: 2026-10-22
description: 'How a two-person frontend team set up an AI development environment centered on Claude Code'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["AI"]

---
# Making AI Agents Work by Team Rules

## A Two-Person Team's Claude Code Setup Story

Our team is two frontend developers building an Astro-based web client.
We started using Claude Code in earnest in March 2026, and by October, **90%** of the commits in our repository were written together with Claude.

When AI starts writing a lot of code, new problems appear.
**Does the code AI writes follow the team's rules?** We actually had cases where a single i18n file was missed and the entire screen broke, where a type error was brushed off with "this is a pre-existing error, so it's unrelated," and where commits went straight to the main branch.

This post is a record of the setup we've built, through experiences like those, to **make AI work by the team's rules**.

## Overall Structure: One Source, Everything Else Follows

We mainly use Claude Code, but we also use GitHub Copilot and Codex.
If you manage rule files separately for each tool, they quickly drift apart, so we decided to keep **the source of the rules in just one place: `.claude/`**.

```
web-astro/
├── CLAUDE.md                ← Table of contents. Guides which docs · agents · skills to use for which task
├── .claude/                 ← Source of the rules (single source of truth)
│   ├── docs/        9       ← Detailed rules: coding conventions, commit rules, state management guide …
│   ├── agents/      5       ← Subagents: bug-fixer, i18n-syncer …
│   └── skills/     10       ← Procedural tasks: issue-pair, api-sync, spec-sync …
├── .github/                 ← Copy for Copilot (copied via the sync-to-copilot skill)
├── AGENTS.md, .codex/       ← Entry point for Codex ("read CLAUDE.md and .claude/")
└── scripts/pre-push.sh      ← The final gate, applied to humans and AI alike
```

Let's go through them one by one below.

## 1. Use CLAUDE.md only as a table of contents

At first, CLAUDE.md was 168 lines. The architecture description, coding rules, and commit rules were all in one file.
The problem is that **CLAUDE.md is read in its entirety in every conversation**. Rules unrelated to the current task take up context every time, and the rules that actually matter get buried.

So we cut CLAUDE.md down to a **47-line table of contents** and moved the detailed rules into `.claude/docs/`.
CLAUDE.md keeps only "if this kind of request comes in, look at this."

```md
## 어떤 요청이 들어오면 무엇을 참고하나

- 신규 컴포넌트 작성 → `.spec.md` 먼저 작성 후 SDD 절차로 구현
- `src/api/` 백엔드 요청 함수 작성/추가 → `api-request-conventions.md`
- 다국어 추가/수정 (4 로케일) ⚠️ → agent `i18n-syncer` 필수 (ko 만 건드리지 말 것)
- 버그 제보 (진단 선행) → agent `bug-fixer`
- 커밋 직전 → `commit-rules.md`
```

The AI looks at the table of contents and reads only the docs it needs. For humans too, it became a map that shows at a glance "what to look at when doing what in this project."

## 2. Leave the "why" behind rules, with a date

If you only write down the rules, over time nobody knows **why the rule exists**. That goes for humans and for AI.
Rules without a known reason either don't get followed when the situation changes even slightly, or, conversely, get applied mechanically even to situations where they don't fit.

So every time we add a rule, we write down **what incident happened, along with the date**.

> **Type errors are a gate** — the pass criterion is 0 errors in changed files AND 0 increase in the repository total.
> - Why this item was added (2026-09-23): The main session only reported type errors and moved on — it wrote off 12 `astro check` errors as "pre-existing errors, unrelated" and went straight to commit · PR. Reporting is not a reason to pass.

> **Check the current branch right before committing** — don't commit on main; create a working branch first
> - (Added after the 2026-09-28 direct-commit-to-main incident)

To uphold this principle, we also put this rule in CLAUDE.md.

> When asked to add a behavioral guideline → before adding it, always ask the user for the reason, and record that reason in the document

When you say "add this rule," the AI first asks "Why are we adding it?" It seems like it'd be annoying, but thanks to this, every rule has a history.

## 3. The main session only directs; repetitive work goes to subagents

The longer you talk with an AI, the more it gradually loses track of rules mentioned earlier. This is **Context Rot**, where the context gets blurrier as it grows longer.
So the main session only does **talking with the user, making decisions, and integrating results**, and work that's repetitive or exploration-heavy is handed off to subagents.
A subagent starts in a clean context, does only its own job, and returns only the conclusion.

| Agent | What it does | Tools it can use |
| --- | --- | --- |
| `bug-fixer` | Analyzes the cause of a bug, and fixes it **only after getting approval** | Read, Edit, Grep, Glob, Bash |
| `i18n-syncer` | Edits all 4 locales — ko · en · ja · zh — at the same time | Read, Edit, Grep, Glob |
| `style-enforcer` | Convention cleanup right before a PR + passing eslint (no behavior changes) | Read, Edit, Grep, Glob, Bash |
| `legacy-refactor-scout` | Diagnoses legacy files → step-by-step refactoring plan | Read, Edit, Grep, Glob, Bash |
| `backend-types-refresher` | Regenerates types from the backend spec + reports the impact scope | Read, Grep, Glob, Bash |

We **deliberately restricted the tools** each agent can use. `i18n-syncer`, which only does translation, can't run shell commands, and `backend-types-refresher`, which only regenerates types, can't edit files directly.

What had the biggest effect was `bug-fixer`'s first rule.

> No Edit/Write without a diagnosis report. The first response must always be a report of the root cause analysis + proposed solution

When AI sees a bug, it wants to fix it right away. That tends to produce fixes that cover up the symptom rather than the cause (like swallowing errors with try/catch).
By having it report the diagnosis first, **the fix goes in after a human understands the cause.**

`i18n-syncer` also came out of an incident. In our project, if a translation key is missing from even one locale, the entire screen fails to render. To prevent the mistake of editing only the Korean file and calling it done, we made it so that i18n work always goes to this agent.

## 4. Tasks with a fixed procedure become skills

If agents are about "who does it," skills are about "how to do it."
Tasks that need to go through multiple steps in a fixed order are made into skills, invoked by a trigger phrase or `/skill-name`.

- **`issue-pair`** — When you say "create an issue," it creates a Jira issue and a GitHub issue as a pair and links them to each other. Both numbers also go into the branch name and commit message.
- **`legacy-ts-migration`** — The procedure for moving legacy jsx to tsx. It first decides whether to keep or remove Redux, replaces the actual usage sites, and then leaves the legacy file as `@deprecated` instead of deleting it right away.
- **`api-sync`** — Re-fetches the backend v3 API spec, updates everything down to the request functions and stores in one go, and reports the affected screens. If the spec hasn't changed, it does nothing.
- **`spec-sync`** — When a component's `.spec.md` changes, it also updates the component · tests · stories in the same folder.

Whether to make a given task an agent or a skill is still something we think about.
At first we moved i18n · convention cleanup from agents to skills, and then moved them back to agents. Our current criterion is **"if it needs to work separately in a clean context, it's an agent; if it's a procedure the main session just needs to follow, it's a skill."**

## 5. Spec before code

Each component has a `.spec.md`. There are 135 of them in the repository.
The spec contains **the promises this component must keep**, like Props, state and behavior, and accessibility, and there's one rule.

> When editing a file that has a `.spec.md`: spec first → code → same commit

When you tell the AI "change this button's behavior," it edits the spec before the code, and then edits the code · tests · stories to match that spec.
The spec becomes **a design document that AI and humans look at together**. During review too, looking at the spec diff first makes the intent immediately clear.

## 6. Keep the things humans must do

We also clearly decided which things we would not hand off to AI.

- **Commits only after a human has checked.** The AI first shows a summary of the changes and asks "Shall I commit as is?" It doesn't commit until a human has confirmed the behavior on screen.
- **AI never pushes.** Anything that goes outside is done by a human directly.
- **Check the branch right before committing.** If it's main, don't commit; create a working branch first.
- **Always include "where to check with your own eyes" in the task completion report.** In frontend, the screen can break even when tests pass. If you only get a list of changed files, a human has to trace "which screen is this?" all over again, so the AI, which has already read the code, lays out the screens to check.

And as the **final gate** applied to both humans and AI, we have a git pre-push hook.

```sh
# scripts/pre-push.sh (summary)
node scripts/check-i18n.mjs   # block the push if en · ja · zh are missing keys relative to ko
# if it's a tag push, check that the package.json version matches the tag
pnpm eslint
```

Rule documents are something the AI reads and follows, but the hook **blocks regardless of whether it's read.** We decided that incidents like missing translations that break the entire screen should be prevented by a hook, not a document.

## 7. Using it alongside other AI tools

We connected GitHub Copilot and Codex in different ways.

- **Copilot — copy.** Following the principle that docs for Copilot should be self-contained, we use the `sync-to-copilot` skill to copy the docs · agents · skills from `.claude/` into `.github/`. We also set up a separate hook on the Copilot side that asks for confirmation before running dangerous commands (`rm -rf`, `git push --force`, etc.).
- **Codex — point.** `AGENTS.md` and `.codex/` only say "read `CLAUDE.md` and `.claude/` first," and the content isn't copied.

Running it ourselves, **copies eventually drift.** While writing this post, I checked and found that the i18n skill's source was 93 lines, but the Copilot copy was 77 lines. The duplicate-key check rule recently added to the source was missing from the copy.
If pointing is possible, that's better, and if copying is necessary, we're left with the homework of automating the sync instead of leaving it as something humans have to remember.

## Closing

Looking back on the setup, it all comes down to one principle.

> **Tell the AI not just the rules, but why the rules came to be.**

If you only give rules, AI misses them in situations that are similar but different. If you give the incident and the reason along with them, it's more likely to judge in line with the rule's intent even in situations it's never seen before.
And accumulating that "why" wasn't just for the AI. It was also a record that keeps our team from repeating the same mistakes months later.
