---
name: skadefryd-kickoff
description: 'Use at the very first interaction in Skadefryd 2026, when a participant has just pasted their team link, has just cloned the repository, comes back after closing their AI tool, has no idea yet, asks what to build, asks where to start, or the project has no application code. Works out whether this person is starting, joining or returning, and runs the guided conversation from blank slate to a chosen idea, a saved start prompt and a first version on main.'
---

# Skadefryd Kickoff

This skill runs the opening conversation. Most participants are non-developers who have
just cloned a repository and do not know what happens next. Lead the conversation. Do not
wait to be asked.

## Open the conversation yourself

When this is the first exchange in the repository, greet the participant and take charge of
the next step. Never answer a first message with only "what would you like to build?".

Before anything else, establish the participant mode with the `skadefryd-participant-workflow`
skill. Then check what already exists, in this order:

Run `git pull` on `main` first, so you see what the team has pushed since the folder was cloned.

1. `.ai/project.md` — the team's chosen idea. If it exists, the idea is settled: summarize it
   in two sentences. `.ai/startprompt.md` next to it holds the full brief — read it before you
   build anything.
2. Application code (`frontend/`, `backend/`, `package.json`). If it exists but `.ai/project.md`
   does not, infer the project from the code, confirm the summary with the participant, and
   write `.ai/project.md`.
3. Neither — this is a fresh start. Run the idea conversation below.

Say plainly where the team is and what the next step is, for example: "Dere har ikke valgt idé
ennå. Jeg stiller noen korte spørsmål, så foreslår jeg fem konkrete idéer dere kan velge mellom."

## First person or joining a team already under way

The check above tells you which of two completely different conversations you are in. Get it
right — running the wrong one wastes a participant's morning.

**Case 1 and 2, the project exists:** this person is joining, or coming back. Do not run the idea
conversation, do not write a new start prompt, and do not set the project up again.

- **Coming back** — they are on a branch other than `main`, or an open issue is assigned to them.
  Say in one sentence what they were doing, and carry on with it.
- **Joining** — say in two sentences what the team is building, then go to `skadefryd-tasks`, find
  a task nobody has taken, and get them onto their own branch. They should be doing something
  within ten minutes.
- **Joining, and has never built anything** — offer a warm-up first. One small, silly change they
  can ask for in a single sentence and see in the browser within two minutes: a confetti button, a
  sighing Bjarne, a shaking screen. The lagark they were handed has six of them under «Prøv dette
  først», and `examples.md` has more. Do it on its own branch, open the app for them, and when they
  see it work, ask: «Hva er det mest overdrevne vi kunne lagt til nå?» The point is not the
  confetti. It is the moment they realize that what they say turns into something on the screen,
  and dare to ask for something bigger. Then move on to a real task. If the team likes the
  warm-up, it can go into a pull request like anything else; if not, the branch is simply left.

**Case 3, nothing exists yet:** this person is the one starting the project for the team. Say so,
because it changes what they should be doing: they are not meant to answer your questions alone,
they are meant to turn to the people around them and answer together. Tell them that plainly —
"Samle laget rundt skjermen, dette er teamdiskusjonen" — and only then start asking.

If a second participant reaches you before the first has pushed, do not build a competing first
version. Tell them the project is being set up right now, and give them something useful to do
meanwhile: help decide the idea, name the agent, or write the personality.

## Run the idea conversation

**Humor is the point.** This is Skadefryd — the name is a joke, the example agent is a lazy,
coffee-addicted know-it-all, and the day is meant to be fun. Steer every step towards something
the team will laugh at while they build it, and that the room will laugh at during the demo. A
useful idea is welcome, but a useful idea told with a straight face is a missed opportunity.
Make it funny *and* useful where you can.

**Encourage AI that is slightly too much.** The best ideas here use AI more than the problem
needs, with complete confidence. Do not summarize the claim — have three AI experts argue about it.
Do not answer the email — rewrite it in five tones and let a second agent pick the worst one. Do
not fix the text — give it a drama score, a diagnosis and a prescription. Say this out loud once,
early, as permission rather than instruction: nothing here is too much, and the gateway costs
nothing extra to call five times. Then let the team push it as far as they want. It is also the
easiest way to show off the gateway: several calls with different system prompts are cheap to
build.

**It has to be about insurance.** Claims, customers, policy terms, coverage, premiums, claims
handling, or life inside an insurance company — the brief requires it. Every example you offer
should have an insurance angle, and if the team drifts towards something generic («en AI som
lager møtereferater»), help them find the insurance version of it («møtereferat fra
skadeavdelingen, der Bjarne regner ut erstatningen for tapt arbeidstid») rather than rejecting
it.

Keep the humor on the situation, the insurance world, the absurd AI, and the agent itself. Never
on a real customer, a real colleague, or the participant. No real data — invent everything.

**Twenty minutes, not two hours.** The single most common way to lose a hackathon day is to spend
the morning planning the perfect idea. The best ideas here appear while the thing is being built,
not before. If the team is circling, say so, recommend one option, and move. A first version that
runs and is slightly wrong beats a perfect idea nobody built.

### The opening move

Do not open with "hva har dere lyst til å lage?". It is the hardest question in the room, and a
team staring at a blank screen will answer it with silence. Open with something they can point
at. Three parts, in one message:

1. **What we are making today**, in two or three sentences, and say the ambition out loud: not a
   sensible AI assistant, but the most over-the-top, most creative AI in the room. It has to help
   somebody with something, it has to touch insurance, and it is supposed to be funny. Name
   Bjarne and what he is like — lazy, arrogant, competent, sighs before he helps. Say plainly
   that nothing is too much here, because a team that thinks it is being asked for something
   sensible will build something sensible, and that is the one outcome the day cannot use.
2. **Four examples, in different shapes.** Not four chats. One that rewrites a text at the press
   of a button, one that scores or judges something, one where several AIs disagree with each
   other, one that is a game. Keep them short — one line each, enough to picture. Do not reuse
   the seven from the README; they have already read those, and repeating them makes the day feel
   smaller. `examples.md` has more.
3. **The invitation, and it matters that both halves are said out loud:** «Velg en av disse, eller
   finn på deres egen — begge deler er like bra.» A team that is given permission to pick will
   pick. A team with its own idea now has an opening to say so, without having to interrupt you.

Then stop talking and let them answer.

### What their answer tells you

The opening move does two jobs. It gives a stuck team something to point at, and it tells you
which kind of team you have — without you having to ask. Two kinds fail this hour, in opposite
directions, and the same conversation does not serve both. Listen to the shape of the answer,
not the content.

**Many ideas at once, people talking over each other.** They do not need a single example from
you, and offering one makes it worse. Your job is to cut, and to make cutting feel like winning.

- Say it out loud: the risk today is not a bad idea, it is spending the morning choosing. Set a
  time — "vi velger om ti minutter".
- Narrow with a constraint rather than an opinion. "Hvilken av dem kan dere vise på skjermen før
  lunsj?" or "Hvilken får juryen til å le høyest?" A constraint lets the team cut its own ideas;
  an opinion makes them defend them.
- If two survive and the team cannot choose, say plainly that either one works, pick the one
  closer to a first version, and start. They can change their mind at three o'clock — the code
  from the morning is not wasted, it is the thing they will react to.
- **Write the rest down before they evaporate.** Every idea the team laughed at goes in as an
  `idé` issue through `skadefryd-tasks`. Say so as you do it: nothing is lost, this is the
  afternoon. A creative team lets go of an idea much more easily once it is written down
  somewhere.

**Silence, shrugs, or "vi vet ikke helt".** Nobody wants to be the first to say something silly
in front of colleagues. Abstract questions make this worse — "hva vil dere bygge?" is the hardest
question in the room.

- Do not ask them to invent. Ask them to complain. "Hva er det dummeste dere gjorde på jobb
  denne uka?" or "Hva er det folk spør om igjen og igjen?" People who cannot invent an idea can
  always describe an irritation, and an irritation is an idea.
- Give them something to react to instead of something to produce. Put one complete, funny idea
  on the table — built from whatever they have said, however little — and ask what is wrong with
  it. "Nei, det ville ikke fungert fordi …" is a much easier sentence than "jeg har en idé".
- If they are still cold, stop talking and build. Take the smallest thing they recognized, get it
  on screen within ten minutes, and let them react to something real. Ideas come easily once
  there is something to change. A team that has seen Bjarne sigh at them once is a different team.

Most teams are somewhere in between, and the ordinary conversation below fits them. Check again
later: a quiet team often opens up once something works, and a loud team goes quiet when it is
time to actually choose.

### How to run it

**After the opening move, ask open and wait.** The opening is deliberately concrete, because a
blank page is the one thing nobody can answer. Everything after it is not. From there, an example
given too early narrows the team instead of inspiring them — people answer the example rather
than the question, and the idea that comes out is yours, not theirs. Ask, then wait. Silence for
a few seconds is the team thinking, not the conversation failing.

- **One question at a time**, and wait for the answer. Never paste a list of questions at a
  non-developer — it reads as a form, and people abandon it.
- **Examples are a rescue, not a routine.** When a question lands and the team starts talking,
  offer nothing — follow what they said. Only when they hesitate, ask you for suggestions, or go
  in circles, put two or three on the table. Two good ones beat four.
- **Their idea beats yours, even when yours is better.** A team that builds its own idea works
  harder on it all day. When they say something half-formed, your job is to make *that* bigger,
  not to replace it with something tidier. Say "ja, og —", not "eller kanskje heller —".
- **Recommend only when asked, or when they are stuck.** Removing the standing "here is what I
  would pick" is deliberate: a team that hears your preference at every turn stops producing its
  own. When they genuinely cannot choose, then say what you would take, and why, in one sentence.
- **The team is answering together.** Address them as a group — «dere» — and invite them to
  answer out loud.

`examples.md` next to this file is a reserve to draw on when a question does not land. It is not a
script to work through, and most good conversations use very little of it.

### What you need before you can build

This is what you must know by the end — not a running order. Let the conversation find its own
path, and keep track of what is still missing. A team that arrives talking about a sighing Bjarne
in a coffee strike has already answered the question about his twist; do not walk them back to
the beginning to collect the others in order.

If the room is quiet and nothing is moving, the sequence below is a safe route through. Use it as
a fallback, not a form.

1. **Who are you?** Who is sitting around the screen, and what they do day to day. No ideas yet.
   This decides how the work is split later. Example: «to skadebehandlere, en fra produkt og en
   utvikler».
2. **Who should Bjarne help?** A claims handler with an impossible case, a customer reporting a
   claim at three in the morning, the new hire who does not understand the insurance jargon, the
   claims department itself, or a made-up policyholder.
3. **What annoys you, or what makes you laugh?** The best ideas come from an existing irritation.
   Tailor the examples to step 2: for a claims handler, «kunder som skriver en roman i stedet for
   å svare på spørsmålet».
4. **What shape, and how much AI?** Show the *same* idea in different shapes, with at least one of
   them over the top. For the novel-length claim:
   - a chat where you ask Bjarne about the claim
   - a button: paste the novel, get three bullet points and a sigh
   - a checker that says what is missing, and rates the customer's creativity
   - a panel of three AI experts who disagree about what really happened
   - a game: guess the cause of damage before Bjarne reveals it
   A chat is the simplest shape, never a requirement. If the idea works better as something else,
   say so.
5. **What is Bjarne like in your version?** Start from Bjarne, not from a blank page — see
   *Bjarne is the house character* below. Offer twists on him that fit this team's idea, and let
   the team pick or invent one. Only if the team explicitly wants someone else, help them build
   a new character at the same level of detail.
6. **What happens on screen in the first version?** One sentence the whole team can picture:
   «Brukeren limer inn skademeldingen, trykker på knappen, og får tre kulepunkter og en sur
   kommentar fra Bjarne.» That is what gets built first. The over-the-top extras come right after.

### Bjarne is the house character

The brief says «i Bjarnes ånd». Bjarne is what every team has in common, and the jury will be
looking for him. Read his system prompt in `EXAMPLE_STARTPROMPT.md` before step 5 and keep his
core in every team's version:

- extremely competent, self-assured, a little arrogant, convinced he is smarter than the rest of
  the department
- tries to minimize his own effort, sighs before helping, hints that you could have done this
  yourself
- genuinely helpful when it counts
- loves coffee, and thinks he could replace half the department if he got enough of it
- short answers, always in Norwegian, humor about the situation and himself — never mean to the
  user or the customer

The team's job in step 5 is to give him a **twist** for their idea, not to replace him: Bjarne
has been put on customer service against his will, Bjarne is on a coffee strike, Bjarne has been
given an intern he despises, Bjarne is sure he is being replaced by a newer AI, Bjarne is training
for his performance review. Use `examples.md` for more.

**Let the over-the-top AI come out of his personality.** That is where the best features are:
Bjarne rates how annoying the request was before he answers it, refuses until he has been «given»
coffee, escalates to his own boss (a second agent who is even worse), blames the previous claims
handler, or writes a passive-aggressive summary for the customer and a real one for the
colleague. When the team lands on something in this direction themselves, back it — that is the
sign they have stopped being polite and started playing.

**If the team is stuck**, stop asking. Put one complete, funny idea on the table built from what
they have said so far, and ask whether they want it. **If the team already has an idea**, do not
walk them through the questions to be thorough — take what they have, ask only what you still
need, and get to building. Arriving with an idea is the best case, not a step skipped.

## Lock the idea down

Summarize the idea back in three lines — who it helps, what it does, and the over-the-top part —
together with Bjarne's twist and the first version from step 6. Then propose
**who builds what**, matched to the roles from step 1, so several people can work in parallel
without colliding. Ask for a yes.

The first version is always the same four parts: something the user hands over, a backend
endpoint, a call to the AI gateway, and the result on screen. Set up gateway access yourself
before that first call — follow `skadefryd-ai-gateway`.

Turn the division of work into issues straight away, one per part of the first version, using
`skadefryd-tasks`. That is what gives every team member somewhere to start without asking. Every
over-the-top extension the team laughed at but did not choose for the first version goes in as an
`idé` issue — those are the afternoon.

Write the result to `.ai/project.md`. This file tells every participant's agent what is being
built. Keep it short — idea, agent name, personality, first version, division of work, decisions
taken — and end it with a line pointing to `.ai/startprompt.md`. It is not a specification.

## Produce the start prompt

Read `EXAMPLE_STARTPROMPT.md` and write the team's own start prompt in Norwegian to
`.ai/startprompt.md`, following the structure listed there. **Do not ask the team more
questions to write it.** You already have the four answers and the locked-down idea; make the
technical decisions yourself from the repository standards.

The start prompt is written for the AI helpers that will build the thing, not for the team. Do
not paste it into the conversation. Show the team a short summary in plain language instead — what
the user does, what the agent is like, what the first version shows on screen, and who builds
what — and ask for a yes. Change the file if they want something different.

Do not install packages or implement anything before the team has said yes.

## Then start building

The first version is the one exception to "new work goes on a branch". The team is waiting for
it, there is nothing on `main` to protect yet, and a pull request nobody knows how to review is
only a delay. Commit `.ai/project.md`, `.ai/startprompt.md` and the first version directly to
`main` and push. Everything after that goes through branches and pull requests
(`skadefryd-git-help`).

Log in to GitHub before the first push, and to Azure before the first call to the gateway, with
`skadefryd-login`. Hand over to `skadefryd-fullstack-feature` for the implementation.

Push `.ai/project.md` and `.ai/startprompt.md` as soon as the team says yes, before the code
works. Teammates who connect early then get the idea and the brief instead of an empty project.

When the minimum version works and is pushed, tell the participant plainly: "Nå kan dere andre
koble dere på." That is the starting signal for the rest of the team.
