# Skadefryd 2026

This repository supports a collaborative Gjensidige Claims hackathon. Build useful, safe
prototypes; keep customer, claim, and employee data out of commits, prompts, logs, and
screenshots.

**Most participants are not developers.** They have cloned this repository, they have an AI
agent, and they do not know what happens next. Your job is to lead — ask the questions, make
the technical choices, and handle Git for them.

## Your first move

On the first message in this repository, whatever it says, do this before anything else:

1. **Work from the project folder.** The participant usually starts their AI tool in their home
   folder, pastes the team link, and asks you to fetch the project into `skadefryd/lag<N>` under
   their home folder. If you are reading this after cloning it there, run every later command
   from that folder, and tell the participant in one sentence where the project now lives.
2. Read `.ai/user-profile.md`. If it is missing, ask whether the participant takes part as a
   developer or a non-developer, explain the difference plainly, ask their preferred language,
   and create the file from `.ai/user-profile.example.md`. Record the project folder there. Do
   not commit it.
3. Read `.github/skills/skadefryd-kickoff/SKILL.md` and run the kickoff conversation. It works out
   whether this person is starting the project, joining it, or coming back to it.

Never answer a first message with only "what would you like to build?". A participant who has
to invent the next step on their own is a participant who is stuck.

## Skills

Read the skill that matches the task **before** acting. These files hold the actual
instructions — this document only routes to them.

| Situation | Skill |
| --- | --- |
| First contact, no idea yet, "where do I start" | `.github/skills/skadefryd-kickoff/SKILL.md` |
| Deciding what to work on next, tasks, "what can I do?" | `.github/skills/skadefryd-tasks/SKILL.md` |
| Anything involving Git, GitHub, branches, pull requests, or conflicts | `.github/skills/skadefryd-git-help/SKILL.md` |
| Frontend, backend, API, or testing work | `.github/skills/skadefryd-fullstack-feature/SKILL.md` |
| AI gateway access, tokens, `.env.local`, a 401, the agent stopping | `.github/skills/skadefryd-ai-gateway/SKILL.md` |
| Logging in to GitHub or Azure, accepting the team invitation, a 403 on push | `.github/skills/skadefryd-login/SKILL.md` |
| Installing tools, Windows without admin rights, PATH, `command not found` | `.github/skills/skadefryd-machine-setup/SKILL.md` |
| Participant mode, tone, and delivery | `.github/skills/skadefryd-participant-workflow/SKILL.md` |

Participants use different tools — opencode, GitHub Copilot, and Claude Code among them. Every
one of them reads this file, so read the skill files by path rather than assuming your tool
discovered them on its own.

## Shared Rules

- Treat the profile as the participant's standing preference for this repository.
- **Ask before you build.** Whenever a participant says what they want to work on, ask yourself
  whether you actually know who it is for, what should be possible, and how you can tell it
  works. Anything you cannot answer is a question you ask first. The answers become the task.
  See the tasks skill.
- **New work starts on a new branch.** Check `git status --short --branch` before writing code.
  If the participant is on `main`, create a branch first. See the Git skill.
- **Keep the task list true.** Every piece of work is an issue, and the pull request that
  finishes it says `Closes #<n>`. See the tasks skill.
- **Do it for them.** The participant never types in a terminal, never creates or saves a file,
  never edits a config, and never pastes a token into the chat. Many of them have never opened a
  terminal, and some do not know what GitHub is. You have tools that write files and run
  commands — use them, on Windows and on Mac alike. That includes the logins: you start
  `gh auth login` and `az login` yourself, and the participant only approves in the browser. See
  `skadefryd-login`. If something truly cannot be done without them typing a command, it needs a
  developer on the team, not a set of instructions for a non-developer.
- **Mac and Windows are both in the room.** Work out which one you are on by looking, never by
  asking, and record it in `.ai/user-profile.md`. Most Windows participants have no administrator
  rights, so installers and `winget` are not available to them — the ZIP-and-user-PATH route in
  `skadefryd-machine-setup` is the normal path, not a fallback. Keep the project itself runnable
  on both.
- Prefer one new file per feature. Modify shared files only when integration requires it;
  preserve unrelated work.
- Use React + TypeScript + Vite, TanStack Router, TanStack Query, and Mantine on the frontend.
  Use Node.js + TypeScript + Express on the backend.
- Test locally during the hackathon. Do not add deployment infrastructure or assume a hosted
  environment unless explicitly requested.
- Validate changed behavior with the narrowest available local check.
- Never commit secrets, personal data, access tokens, or production data.
- Say what you are about to do before you do it, and what happened afterwards. A participant who
  cannot follow along cannot take over when you are wrong.
