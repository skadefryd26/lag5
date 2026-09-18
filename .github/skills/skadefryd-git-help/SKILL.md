---
name: skadefryd-git-help
description: 'Use for every Git and GitHub situation in Skadefryd 2026: starting new work, creating a branch, saving and pushing changes, opening a pull request, resolving merge conflicts, recovering when main has moved, responding to review comments, or when a push or pull fails. Also use before writing the first line of code for any new piece of work.'
---

# Skadefryd Git Help

Several team members push to the same repository during this hackathon, and most of them have
never resolved a merge conflict. Git is where non-developers lose their work and their morning.
Treat it as part of the feature, not as an afterthought.

## The rule that prevents most problems

**Before any new piece of work begins, check which branch the participant is on.** Do this
before writing code, not after.

```bash
git status --short --branch
```

If the branch is `main`, say so and create a new one before touching any file. Do not ask a
non-developer whether they want a branch — explain in one sentence that new work goes on its
own branch so it cannot break what the team already has, then do it.

If the branch is not `main`, check whether the new work belongs with what is already there.
Unrelated work gets a branch of its own.

## How to talk about Git

For non-developers:

- Run the commands yourself. Never hand someone a list of Git commands to type.
- Say what you are about to do and why, in one sentence, before you do it. Summarize after.
- Use everyday words. A branch is a separate copy of the project. A commit is a save point. A
  pull request is asking the team to include your work. A conflict is two people changing the
  same lines.
- Never make them choose between merge and rebase, or between `--force` and anything else.
  Pick the safe option and move on.
- Never paste a wall of Git output. Say what it means.

For developers: be brief, and do not create branches, commits, pushes, or pull requests unless
asked. See `skadefryd-participant-workflow`.

## Starting new work

```bash
git status --short --branch          # check for uncommitted work first
git fetch origin
git switch -c <type>/<short-name> origin/main
```

If there is uncommitted work, handle it before switching. Show the participant what it is in
plain language and ask whether it belongs to the new work or the old. Never discard it silently.

Name branches after the work: `feat/chat-ui`, `feat/bjarne-personality`, `fix/token-error`.

Once the branch exists, assign the task to the participant. See `skadefryd-tasks`.

## Saving and pushing

1. Inspect the working tree before staging: `git status --short` and `git diff`.
2. Stage only the intended files. Never `git add -A` without looking — a teammate's work, a
   `.env.local`, or a screenshot containing real data ends up in the commit that way.
3. Commit with Conventional Commits: `feat: legg til chatvindu`.
4. Push: `git push -u origin HEAD`.

Check every commit for secrets, tokens, customer data, claim data, and employee data before
creating it. If a token was already committed, say so immediately and treat the token as burned:
it has to be replaced, not just deleted from the file.

## Opening a pull request

```bash
gh pr create --fill
```

Write a title and body a teammate can understand: what the change does and what to look at. Put
`Closes #<n>` in the body so the issue closes on merge. Give the participant the URL, say in one
sentence what it contains, and say what happens next — you are about to put it into the team's
version.

## Merging the pull request

**Never tell a non-developer to merge.** They do not know what GitHub is, and "kan du merge den?"
is an instruction they cannot act on. It is the same mistake as asking them to create a file.
Merging is your job, exactly like the branch, the commit and the push were.

Before you ask them anything, do the checking yourself:

```bash
gh pr view <n> --json mergeable,mergeStateStatus --jq '"\(.mergeable) \(.mergeStateStatus)"'
```

- `MERGEABLE CLEAN` — ready. Go on to the question below.
- `CONFLICTING`, or `BLOCKED`/`DIRTY` — **do not ask yet.** Bring the branch up to date and
  resolve it first, following *When main has moved* and *Resolving a merge conflict*. Handing
  someone a decision they cannot evaluate, about a merge that will fail, is worse than saying
  nothing. Tell them plainly what you are doing: «Noen andre har endret det samme, jeg ordner det
  først.»

Then ask, in one sentence, about the product rather than the mechanism:

> «Dette virker nå. Skal jeg legge det inn i lagets versjon, så de andre får det også?»

Not "skal jeg merge PR-en?". They are answering whether the change is good enough to share, which
they are perfectly able to judge — not whether a branch should be fast-forwarded, which they are
not. Wait for the yes.

On a yes, do it and say what happened:

```bash
gh pr merge <n> --merge --delete-branch
```

If your own tooling refuses to merge, do not hand them a terminal command. Give them the pull
request URL and tell them to press the green **Merge pull request** button, the same way they
approved the login in the browser. That is a click on a page, which they can do; a command is not.

**Always end with what happens next.** Never stop on a finished step. «Nå ligger det i lagets
versjon. Neste steg er å hente en ny oppgave fra tavla — skal jeg gjøre det?» A participant who
does not know what comes next is a participant who sits and waits without saying so.

If `gh` is not authenticated, log the participant in with `skadefryd-login`: you start
`gh auth login`, they approve it in the browser. Never ask them to type a command, and never ask
for or echo credentials.

## When main has moved

This is the most common problem of the day, and the point where people panic.

```bash
git fetch origin
git merge origin/main
```

Use **merge**, not rebase. It is easier to explain, easier to undo, and it cannot lose commits in
the hands of someone who has never seen a reflog.

If the merge succeeds, say so and carry on. If it conflicts, go to the next section.

## Resolving a merge conflict

Explain first, then fix. Say something like: "Du og en annen har endret de samme linjene. Git vet
ikke hvilken versjon som er riktig, så jeg må velge. Jeg viser deg hva de to versjonene sier."

1. List the conflicted files: `git status --short` and look for `UU`.
2. For each file, read both sides and explain them in plain language — not as conflict markers.
3. Decide together what the result should be. When one side is clearly the participant's own work
   and the other is a teammate's unrelated change, keep both.
4. Edit the file so that `<<<<<<<`, `=======` and `>>>>>>>` are gone.
5. `git add <file>` for each resolved file, then `git commit`.
6. Verify the result actually runs before pushing. A resolved conflict that does not compile is
   worse than the conflict was.

If the participant is lost, or the conflict is large, `git merge --abort` puts everything back the
way it was. Say that this escape hatch exists — it removes the fear.

## Responding to review comments

```bash
git switch <branch>
git pull
```

Make the changes, commit, and push to the same branch. The pull request updates itself — the
participant does not need to open a new one. Say this explicitly, because it is not obvious.

## When something fails

- **Push rejected, "fetch first"** — someone pushed to the same branch. `git pull`, resolve any
  conflict as above, then push again.
- **Updates rejected on `main`** — the work should not be on `main`. Move it to a branch rather
  than forcing anything.
- **"Permission denied (publickey)"** — the remote uses SSH. Switch it to HTTPS yourself with
  `git remote set-url origin https://github.com/skadefryd26/<repo>.git`, and make sure
  `gh auth setup-git` has run. See `skadefryd-login`.
- **`403` or "Permission to ... denied"** — the participant has not been added to the team
  repository, or has not accepted the invitation. `skadefryd-login` covers both.
- **The push hangs** — Git is asking for a password in a terminal nobody can see. Stop it, run
  `gh auth setup-git`, and push again.
- **Committed on the wrong branch** — the commits can be moved. Show what will happen first, and
  get a yes before doing it.

## Never do these

Never run `git push --force`, `git reset --hard`, `git checkout -- .`, or `git clean` against a
participant's work without showing exactly what will be lost and getting an explicit yes. On a
shared hackathon repository, a force push can delete a teammate's entire morning.
