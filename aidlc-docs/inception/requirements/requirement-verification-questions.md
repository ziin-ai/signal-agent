# Requirements Verification Questions

AI-DLC Inception — Requirements Analysis gate.

**Resolved via user message `계속` (2026-07-28):** empty answers treated as acceptance of **recommended defaults** below. Change any answer and say `revise` if wrong.

Also: **RE approved by implication** (continue without requesting full-product RE).

---

## Question 1

What Construction scope should this AI-DLC run cover in the first pass?

A) Full package: evergreen guides + About identity + home static intro + legal/posts prerender

B) Content-first: evergreen guides + expand existing 3 guides only (no UI/layout changes yet)

C) Site chrome-first: About + home intro + prerender only (guides later)

D) Minimal: About identity + home intro only

E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2

How many **new** evergreen educational posts should Construction produce in this pass? (in addition to expanding the existing 3 if selected)

A) Expand the existing 3 only — no new titles this pass

B) 5 new guides (plus deepen existing 3)

C) 10 new guides (plus deepen existing 3)

D) 12–15 new guides (plus deepen existing 3)

E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 3

What publisher identity can we put on About **now**?

A) Keep placeholder — only clarify “개인/팀 운영, 사업자 정보 추후 등록” wording

B) Add operator display name + contact email + location (city/country) you will provide in Other / follow-up

C) Add full business registration fields (상호, 사업자등록번호, 주소) — you will provide exact strings

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4

How should we treat **existing** daily/outlook posts that still use old TL;DR / N-variable templates?

A) Leave historical posts as-is — expert voice only for new posts via skills

B) Rewrite a sample set (e.g. last 5 outlooks) in call/priority/guardrail voice

C) Rewrite all korea-market-outlook / daily-summary family posts

D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5

Home page static intro: preferred intensity?

A) Short block: 2–3 sentences + links to `/about`, `/posts`, and 3 guide posts

B) Medium: intro + “시작 가이드” section listing 6–8 educational posts

C) Skip home changes this pass

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6

Should legal pages (`about`, `privacy`, `terms`, `contact`) and `/posts` index get `export const prerender = true`?

A) Yes — prerender all of them

B) Legal pages only

C) No — SSR HTML is enough; skip prerender changes

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7

After Construction, git publish behavior?

A) Commit + push to `main` when each unit completes (match existing skill git-publish habit)

B) Commit locally only — ask before push

C) Do not commit — leave working tree for manual review

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8

Guide topic selection for new evergreen posts?

A) Agent proposes a topic list in Workflow Planning; you approve before writing

B) Agent picks topics and writes without a separate topic-approval gate (faster)

C) You will paste an explicit topic list in Other / follow-up

D) Other (please describe after [Answer]: tag below)

[Answer]: B
