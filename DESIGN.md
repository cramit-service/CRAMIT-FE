# Cramit Design System

Cramit is an AI study assistant for university students. Students upload lecture
slides and a recording; the recording becomes a transcript and the transcript
becomes an AI summary. They then study the slides and the summary side by side,
replay the lecture per page, take notes, and track what is left before the exam.

This document is the contract for how that product looks. Every rule here was
settled deliberately, and the reasoning is kept beside the rule so a later reader
can tell a decision from an accident.

**Status.** Sections are filled as they are settled. A section marked
`Undecided` has no rule yet — build nothing from it, and do not fill the gap
with a plausible default (see §7).

---

## 1. Experience

### Visual Theme & Atmosphere

Cramit is a reading tool before it is anything else. The study screen is split
in half: lecture material on the left, AI summary on the right. The left half is
a PDF whose appearance the product does not control — it is white paper. The
right half is long-form text. Students read both for hours in the days before an
exam.

That single fact drives the surface system in §2: the interface stays in the
same brightness band as the paper it displays, and it separates its own surfaces
quietly enough that neither half competes with the material being studied.

### Principles

> **Undecided.**

### Personas

> **Undecided.** Public product copy establishes the audience as Korean
> university students; specifics beyond that are not yet settled.

---

## 2. Foundations

### Surfaces

Cramit is a reading tool. Half of the study screen is a PDF we do not control —
it is white paper. The summary beside it is long-form text. Students read both
for hours before an exam. The canvas therefore stays light, in the same
brightness band as the paper.

Depth cannot be built from brightness here: white is the ceiling. Cramit
separates surfaces by **fill**, and reserves shadow for things that float.

| Level   | Token              | Value     | Use                                    |
| ------- | ------------------ | --------- | -------------------------------------- |
| Canvas  | `--color-canvas`   | `#fcfaf7` | Page background                        |
| Surface | `--color-gray-100` | `#ffffff` | Cards, panels, modals, menus           |
| Well    | `--color-gray-200` | `#f0f1f1` | Recessed areas: search field, viewport |

Borders are not the default separator. Shadow is used **only** on surfaces that
float above the page — modal, dropdown, tooltip — never on cards in a list.

**Known cost.** Canvas to surface is ΔE 2.35 (ΔL\* 1.65), barely past the
threshold where a difference registers. Soft card edges are the deliberate
choice: a quiet screen over a crisp one. Canvas to well is ΔE 3.76, twice as
large, so the ladder is uneven by acceptance, not by oversight. If card edges
ever need strengthening, deepen the canvas rather than add borders — that keeps
fill as the single mechanism.

### Color Palette & Roles

> **Undecided.** The ramps exist in `src/app/globals.css`; their roles are not
> yet written down here.

### Depth & Elevation

> **Undecided.** Surfaces §2 settles _when_ shadow is used (floating surfaces
> only). The shadow values themselves are not settled.

### Spacing & Sizing

Spacing and size are separate scales. Spacing answers _how far apart_; size
answers _how big_. The two are set by different forces, so they do not share a
list.

#### Spacing

Empty space — `padding`, `margin`, `gap` — comes from this list and nothing
else. The base unit is 4px, which is already Tailwind's default spacing step, so
these are its stock classes rather than new tokens.

| px    |   0 |   4 |   8 |  12 |  16 |  20 |  24 |  32 |  40 |  48 |  64 |  80 |  96 |
| ----- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| class |   0 |   1 |   2 |   3 |   4 |   5 |   6 |   8 |  10 |  12 |  16 |  20 |  24 |

Two judgments are built into that list.

**Steps of 4 up to 24, then wider.** 28, 36, 44, 56 and 72 are deliberately
absent. The eye reads spacing as a ratio, not an absolute: 4 and 8 differ by
double and are obviously distinct, while 80 and 84 differ by 5% and are not. A
step nobody can see is a step that costs a decision and returns nothing.

**The list stops at 96.** Larger gaps are the distance between sections, which
is a layout decision rather than a spacing value, and belongs to §5.

An 8px base was considered and rejected. With 8 as the smallest step, the
innermost gap in a card equals the gap between its groups, and grouping stops
being expressible — a card's title block reads as three loose lines instead of a
label, a title, and a date beneath them.

#### Control height

Buttons, fields, tabs and other controls take their height from this list.

| Step |  px |
| ---- | --: |
| sm   |  32 |
| md   |  40 |
| lg   |  44 |
| xl   |  48 |
| 2xl  |  56 |

Control height is not drawn from the spacing list. The clearest reason is 44px:
it is the minimum touch target, it is a multiple of 4, and the spacing list steps
40 → 48 straight past it. One shared list would mean discarding a value that has
a reason behind it.

#### Icon size

Settled in typography (§3): an icon takes the nearest 4px step to the size of
the text beside it. Beside body text that yields 16, 20 and 24, all of them on
the 4px base.

#### Line height against the 4px grid

Settled in typography (§3): the grid does not govern line height. Three of the
eight type steps land off it — `label` (14/22), `body-md` (20/30) and
`heading-lg` (52/74) — and all three stay. Correcting either moves its ratio further from the 1.5 the body ramp is
built on, and a reader notices a line that is too tight long before anyone
notices two pixels of drift. It does not change the spacing list.

### Motion & Easing

> **Undecided.**

---

## 3. Typography & Assets

### Typography Rules

Eight steps. Sizes come from the design file; line heights and tracking are
settled here. Weight is never part of a token — it is set separately, and
**Weight** below says with what.

| Role      | Token               | Size | Line height | Ratio |
| --------- | ------------------- | ---: | ----------: | ----: |
| Label     | `--text-label`      |   14 |          22 |  1.57 |
| Body S    | `--text-body-sm`    |   16 |          24 |  1.50 |
| Body      | `--text-body`       |   18 |          28 |  1.56 |
| Body M    | `--text-body-md`    |   20 |          30 |  1.50 |
| Body L    | `--text-body-lg`    |   22 |          32 |  1.45 |
| Heading S | `--text-heading-sm` |   24 |          36 |  1.50 |
| Heading M | `--text-heading-md` |   32 |          44 |  1.38 |
| Heading L | `--text-heading-lg` |   52 |          74 |  1.42 |

#### Line height

Body steps (14–24) sit at roughly 1.5. The large headings run tighter — 32 at
1.38 and 52 at 1.42 — because a large line needs proportionally less space
beneath it to still read as one line rather than as a paragraph.

The 4px grid does not govern line height. The grid governs the space between
things, which §2 settles. A line box is not space between things; it is the text
itself. Where the two disagree, reading wins.

16/24 was settled first, against the summary panel — the long-form reading
surface §1 is built around. At 24 a wrapped paragraph holds together as one
block; at 28 its lines drift apart. The air that 28 would have bought belongs in
the gap between items instead, where it is a spacing decision (§2) and can be
tuned without touching the text.

`body` then moved 30 → 28. At 30 it was 1.67 — the only body step away from the
1.5 the rest of the ramp sits on. Nothing else moved. That 28 also lands on the
4px grid is a consequence, not the reason; reversing the two would make the next
reader think the grid decides.

**Known cost.** `label` (1.57) and `body-lg` (1.45) are not 1.5, and three of
the eight steps sit off the 4px grid — `label` (22), `body-md` (30) and
`heading-lg` (74). Each available correction is worse: 14/20 is 1.43, 22/33
leaves the grid anyway, and 20/28 is 1.40 — further from 1.5 than the value it
would replace.

#### One line height and one tracking per size

A size carries one line height and one tracking. Weight does not change either,
because weight is not part of the token.

The design file splits some sizes in two — 16 into 24 and 28, 20 into 30 and 28,
32 into 42 at weight 400 and 44 at weight 600. Those splits do not survive here.
A second line height on the same size has to be chosen every time that size is
used, and the thing it was usually encoding — the height of a button — is
settled by control height in §2 instead.

Where a split had to be resolved: 32 takes 44, and 24 takes −0.02em rather than
the −0.025em one of its two styles carries. At 24px that tracking difference is
0.12px.

#### Weight

Three weights. 400 carries text read as sentences; 500 carries the fragments —
labels, metadata, button text; 600 is headings and emphasis.

What separates 400 from 500 is not whether something can be pressed. Fill,
cursor and shape carry that, and they carry it for links, tabs and triggers as
well; weight put to the same job spreads across the screen until it signals
nothing, and it would make a typography rule depend on §4, which is undecided.
The split is between reading and scanning. A fragment at 400 goes thin and
drifts off its row; a sentence at 500 is heavy to stay with for an hour, and §1
says an hour is the case to design for.

The design file reaches the same three weights and assigns them the same way:
every `Button/*` style is 500, `Body/Regular2` and `Body/Medium` are 400, and
the `*B` headings are 600.

#### The ramp stops at 14

There is no 12px step. A step exists when a role needs it, and no role needs to
be smaller than a label. Text set at 12px is there because a box is narrow, and
a narrow box is a layout problem — the layout solves it, not the text.

This is not free. Anything that relies on 12px today has to be redrawn rather
than reclassed. That is a migration cost, not an argument for keeping the step.

#### Icon size

An icon takes the nearest 4px step to the size of the text beside it. Beside
body text that is 16, 20 or 24; beside a heading it is the heading's own size.

The size is bound to the text, then rounded onto the same 4px base the rest of
§2 uses. The ramp's 16, 20, 24 and 32 already sit on it, so only 14, 18 and 52
round up.
Matching the text exactly was the alternative and is worse: a stroke icon drawn
on a 24-unit grid and rendered at 18 puts its strokes on half pixels and reads
blurred.

#### Removed tokens

| Token       | Was   | Why                                                                                                   |
| ----------- | ----- | ----------------------------------------------------------------------------------------------------- |
| `button-lg` | 20/28 | Same size as `body-md`. Every use is a fixed-height button, where line height changes nothing.        |
| `button-sm` | 16/28 | Same size as `body-sm`. Named for buttons, but most uses were paragraphs, headings, hints and badges. |

A token named after a component starts lying the moment that component stops
being its only user. Size and line height belong to the ramp; a button's height
comes from control height (§2).

#### The landing page is outside the ramp

> **Undecided.** The landing page is pre-login marketing, it opens on phones,
> and it scales its headings with the viewport — which this ramp deliberately
> does not do. It is governed by its own scale. That scale is not settled: the
> current design is a placeholder, and a placeholder is not a source (§7).

---

## 4. Components & States

### Component Stylings

> **Undecided.** Which components are shared primitives — and which stay local
> to one screen — is not yet settled.

### States

> **Undecided.** Loading, empty, error and disabled are required, not optional:
> transcription and AI summarization are asynchronous and the UI polls
> `READY`/`PROCESSING`. Their appearance is not yet settled.

---

## 5. Layout & Platforms

### Layout Principles

> **Undecided.**

### Responsive Behavior

> **Undecided.** The current rule lives in `CLAUDE.md` §4-4 — typography keeps
> its design px at any width, while viewport-proportional containers use the
> ratio measured from the design. Whether that rule survives is not yet settled.

---

## 6. Content & Locales

### Voice & Tone

> **Undecided.** This document is written in English; the product's interface
> copy is Korean. Rules here govern Korean UI text.

---

## 7. Governance

### Application priority

1. Direct user instructions for the requested scope.
2. This document.
3. The Figma design file.
4. The current state of the repository.

Where this document and the Figma file disagree, this document wins and the
design file is corrected later. Where this document says nothing, the Figma file
governs.

### Unknowns

Omit only the smallest unresolved value or group. Do not replace it with a
plausible default.

### Changes

Record, review, and validate changes before adoption. A rule lands here with the
reasoning that produced it, including the cost that was accepted.

### Provenance

The section structure of this document was adapted from a published
reconstruction of Linear's design language. None of that document's values,
components or observations were carried over — only the shape of the contract.
