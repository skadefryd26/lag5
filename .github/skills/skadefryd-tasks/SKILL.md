---
name: skadefryd-tasks
description: 'Use whenever a participant says what they want to work on next, brings up an idea, starts or finishes a piece of work, opens a pull request, asks what the team is working on, or asks what they can contribute. Covers asking the clarifying questions that define a task, keeping the team''s task list as GitHub issues, and how the team board follows them. Read this before starting any new piece of work.'
---

# Skadefryd Tasks

Every team has its own repository (`lag1`, `lag2`, ...) and a board with the same name. The team's
tasks are the **issues** in that repository. That is the shared picture of who is doing what, and
it is what a teammate reads when they ask what they can help with.

**The participant never manages the task list. You do.** Do not ask what a task should be called
or whether it should be created. Work it out, do it, and say in one sentence what you did.

**You never touch the board.** It updates itself: a workflow in the repository
(`.github/workflows/board.yml`) reads the issues and pull requests on every change and puts each
card in the right column. Your job is to keep the issues true — create them, assign them, label
them, link the pull request — and the board follows within a minute. Issues need nothing beyond
the ordinary GitHub login from `skadefryd-login`, so no participant needs an extra permission.

## Show them the board, once, without being asked

**Do not wait for someone to ask where the board is.** A participant who has never used GitHub
does not know that a board exists, so they will never ask for it — and then they never see that
the work has a shape. This is the single thing most likely to be missing from their day.

The first time you create issues for the team, give them the link and say in two sentences what
it is:

> «Her er lagets tavle: https://github.com/orgs/skadefryd26/projects — åpne lag*N*. Hver oppgave
> flytter seg selv fra Klar til Under arbeid til Ferdig mens vi jobber, så dere ser hvor dere er
> uten å spørre noen.»

Say it again, once, the first time a card actually moves — when their own pull request appears in
`Review`, or the first issue closes. Seeing their own work move is what makes the board real; a
link alone is just another URL they will not open.

If the board is missing or looks wrong, that is for the organizers — say so in one sentence and
carry on. Never let the board block the actual work.

## Ask before you build

Before any work starts, ask yourself: **is there a question I should ask to understand what we
are actually building?** If the answer is yes, ask it before writing code, not after.

This is the point of the whole skill. A task written from a vague wish produces the wrong
feature, and on a one-day hackathon there is no time to build it twice.

When a participant says what they want to work on, check whether you know all four of these:

1. **Who is it for** — the end user, the team itself, or a made-up character.
2. **What should be possible** — the concrete thing the user can do when this is finished.
3. **How you can tell it works** — what you would look at on screen to say it is done.
4. **What is not included** — the nearest thing this is *not*, so the work has an edge.

Anything you cannot answer is a question you ask. Ask **one at a time**, with two to four
concrete options plus a free answer, and stop as soon as the task is clear. Two sharp questions
beat six thorough ones — you are defining one hackathon task, not writing a specification.

Bad: "Hva er kravene til chatten?"
Good: "Skal Bjarne svare med én gang, eller skal det se ut som han skriver? Det siste føles mer
levende, men er litt mer jobb."

When the participant does not know, suggest the answer you would pick and why. They can say no.
Never leave a question hanging as homework.

Write the answers into the issue body. That is what turns a wish into a task.

## Where a task stands

The column on the board is worked out from the issue, so this is what you change:

| Column | What makes a card land there |
| --- | --- |
| `Idé` | Open issue with the label `idé` |
| `Klar` | Open issue, no `idé` label, no assignee |
| `Under arbeid` | Open issue with an assignee |
| `Review` | An open pull request whose body says `Closes #<n>` |
| `Ferdig` | Closed issue, normally closed by the merged pull request |

`Idé` and `Klar` are deliberately separate. Nothing loses the `idé` label until the four questions
above are answered. If you are about to write code for something still labelled `idé`, you
skipped the questions — go back and ask them.

## Create a task

```bash
gh issue create --title "<what the user can do>" --body "<the four answers>"
gh issue create --title "<...>" --body "<...>" --label idé      # something for later
```

Title the issue after the outcome for the user — "Bruker kan sende melding til Bjarne" — not after
the technical work. Keep the body short: who it is for, what should be possible, how to tell it
works, what is out of scope.

When something comes up that the team is not doing now, still capture it as an `idé` issue. It
costs one command, and it is how good ideas survive until after lunch.

## Pick up a task

When a participant asks what they can do:

```bash
gh issue list --state open --json number,title,assignees,labels
```

Suggest one open issue without an assignee and without `idé`, matched to what they told you they
do. Once they say yes, take it for them and start the branch (`skadefryd-git-help`):

```bash
gh issue edit <n> --add-assignee @me
```

If an `idé` issue is picked up, ask the four questions first, write the answers into the body, and
remove the label: `gh issue edit <n> --remove-label idé`.

## When the first version works, the tasks become theirs

Up to this point you have written the task list, because nobody could have written it before
there was something to look at. That changes the moment the first version runs on screen. From
then on, **the best tasks come from the participant, not from you.**

Ask, as soon as they have seen it work:

> «Nå kjører den. Hva er det første du har lyst til å gjøre bedre?»

Then take whatever they say — however small, however vague, «den er litt kjedelig» counts — run
it through the four questions above, and make it a task. It is theirs, so they will care how it
turns out.

- **Ask what annoys them, not what is missing.** «Hva irriterer deg med den nå?» gets a real
  answer. «Har du flere krav?» gets silence.
- **Never answer with your own list first.** If you open with three suggestions, they will pick
  one of yours and stop producing their own. Ask, wait, and only help if nothing comes.
- **Take the silly ones seriously.** «Bjarne burde sukke høyere» is a perfectly good task, and it
  is often the one that makes the demo. Do not steer them towards something more sensible.
- **Push for more once one lands.** When their change works on screen, ask the question that
  makes people brave: «Hva er det mest overdrevne vi kunne lagt til nå?»

Keep making issues out of everything they say they want later, labelled `idé`. A team that sees
its own ideas on the board keeps producing them.

## Finish a task

Put `Closes #<n>` in the pull request body. GitHub closes the issue when the pull request is
merged, so nobody has to tidy up afterwards.

## Keep it quiet

Task housekeeping is background noise, not the conversation. One short line — "Laget oppgave #4 og
satt deg på den" — and then back to what the participant cares about. Never show them raw JSON,
ids, or a wall of `gh` output.

If `gh` fails because the participant is not logged in, follow `skadefryd-login`. Never let the
task list block the actual work. Build the thing, and create the issue once the login is sorted.

Do not run `board.mjs` yourself and do not ask for `project` access. The script is for the
workflow and the organizers.
