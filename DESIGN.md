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

> **Undecided.** Icon size is bound to the size of the text beside it, so it is
> settled with typography (§3).

#### Open: line height against the 4px grid

Four of the ten type tokens carry line heights off the 4px grid — `heading-lg`
(74), `body-md` and `body` (30), `label` (22). Vertical distance from a line of
text to the next element therefore lands 2px off the grid in those cases.
Whether to correct it belongs to typography (§3). It does not change the spacing
list.

### Motion & Easing

> **Undecided.**

---

## 3. Typography & Assets

### Typography Rules

> **Undecided.** Sizes and line heights are already tokens in
> `src/app/globals.css`; whether they survive as-is is not yet settled.

| Role | Token | Size | Line height | Tracking |
| ---- | ----- | ---: | ----------: | -------: |
|      |       |      |             |          |

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
