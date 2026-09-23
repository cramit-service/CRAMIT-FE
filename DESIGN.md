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

| Level   | Token             | Value     | Use                                    |
| ------- | ----------------- | --------- | -------------------------------------- |
| Canvas  | `--color-canvas`  | `#fcfaf7` | Page background                        |
| Surface | `--color-surface` | `#ffffff` | Cards, panels, modals, menus           |
| Well    | `--color-well`    | `#f0f1f1` | Recessed areas: search field, viewport |

Borders are not the default separator. Shadow is used **only** on surfaces that
float above the page — modal, dropdown, tooltip — never on cards in a list.

**Known cost.** Canvas to surface is ΔE 2.35 (ΔL\* 1.65), barely past the
threshold where a difference registers. Soft card edges are the deliberate
choice: a quiet screen over a crisp one. Canvas to well is ΔE 3.76, twice as
large, so the ladder is uneven by acceptance, not by oversight. If card edges
ever need strengthening, deepen the canvas rather than add borders — that keeps
fill as the single mechanism.

### Color Palette & Roles

**Lime is what you press. Blue is what the product tells you. Where something
is both, lime wins.**

Two colors carry the brand. What separates them is not how important the thing
is — it is whether the thing can be pressed.

| Token                  | Value     | Where                                               |
| ---------------------- | --------- | --------------------------------------------------- |
| `--color-lime-pale`    | `#f1ff89` | Lime over a large area — the study highlight        |
| `--color-lime-action`  | `#e3ff00` | The fill of anything pressable                      |
| `--color-lime-hover`   | `#d1eb00` | The fill under a cursor                             |
| `--color-lime-pressed` | `#bfd600` | The fill while held                                 |
| `--color-sky-pale`     | `#e7f7fa` | A state surface carrying no text — a progress track |
| `--color-sky-status`   | `#4dd8ff` | A state fill, with near-black text on it            |
| `--color-sky-ink`      | `#0475b9` | State that is text alone, on canvas or a card       |

An element that is both — an active tab, a checked box, a highlight that opens
a note — is lime. The first question is whether the element itself takes a
click, and where the answer is yes the second question is never asked.

These seven are the whole of the brand palette. The gray scale stands beside
them and is named below; every other color the product uses is out of scope
here.

> **Undecided.** The eleven subject colors and the two level colors. The subject colors are held back
> deliberately: whether a subject is told apart by color at all is still
> being decided, and settling a palette first would answer that question by
> accident.

#### The name carries the hue and the job

**A number is only honest where there is a scale behind it.**

Brand tokens are named `<hue>-<job>`. The hue comes first so that typing
`bg-lime` offers everything lime is allowed to do, which is the same list this
section defines. A new color arriving later takes the same shape, so an
exception does not break the pattern.

Ramp numbers are not used for the brand colors. Of lime's four values three
are computed from the fourth, and none of the four sit at even intervals, so a
number would report a position that does not exist. The gray scale keeps its
numbers, because there the lightness really does step from 100 to 950 and the
number is the position. The single rule is **numbers where there is a scale,
jobs where there is not.**

The framework's own palette is removed rather than left underneath
(`--color-*: initial`). Unused default colors are not neutral: while
`bg-red-500` still resolves, nothing in the build objects to a color that this
document never granted. With the default palette gone, a color outside this
section produces no style at all.

#### Importance is not the criterion

**A rule that needs taste returns a different answer per author.**

The rule this replaces read _lime for the key CTA, blue for ordinary confirm
actions_. It cannot hold, because **key** is a judgment and every author's own
screen has the key button on it. That is how a palette drifts while every
individual choice looks defensible.

_Does this take a click_ has one answer. It is the same move §3 makes for
weight, where the split is reading against scanning rather than something that
has to be weighed.

#### Lime is a fill, never text

**Lime's place is behind text, not in it.**

On the canvas lime is 1.09:1 — not faint, absent. With near-black text on it
lime is 16.9:1, the strongest pair in the system.

So lime is not a color that fails as text; it is a color whose place is the
fill. Text, icons and links are never lime. An interactive label with no fill
behind it takes no color at all — position, cursor and shape carry that, the
same division §3 relies on for weight.

Blue does both, but not at the same step. `#4dd8ff` is a fill and takes
near-black text (11.5:1). `#0475b9` is 4.74:1 on the canvas and 4.94:1 on a
white card, so state that is only text — a due date, a count, a status — can
be blue with nothing behind it.

**Pale blue carries no blue text.** `#0475b9` on `#e7f7fa` is 4.49:1. A state
surface either holds near-black text or holds none.

#### Pressed states are computed, not picked

**Hover and pressed are the fill with 8% and 16% black over it.**

Lime cannot be darkened by walking down a ramp. Hand-picked steps move
saturation along with lightness, and the existing ones drift in hue: `#bedd0c`
is hue 69 and `#99bb17` is 72, so the signature turns olive at the moment it
is pressed. Compositing black moves lightness alone — `#d1eb00` is hue 67 and
`#bfd600` is 66, both still lime.

The two values also follow the fill. Change `#e3ff00` and they recompute;
three hand-picked values would have to be matched by hand, which is how the
present ramp left its own hue.

#### A ramp is as long as the color's job list

**Length follows from the number of jobs, so the two ramps are different
lengths.**

Nine steps per color is a framework default, not a decision. Lime has four
jobs — pale fill, fill, hover, pressed. Blue has three — pale fill, fill,
text. **Blue has no hover or pressed, because nothing blue is ever pressed.**
That falls straight out of the rule above.

The steps below 500 are not available to lime in any case:

| Step | Lime hue | Blue hue |
| ---- | -------: | -------: |
| 400  |       67 |      193 |
| 600  |       72 |      199 |
| 800  |       94 |      200 |
| 900  |      145 |      195 |

Blue is blue all the way down. **Lime stops being lime.** By 600 it reads as
olive and 900 is green — a different color wearing the signature's name, which
is worse than no step at all, because the name invites use. Those steps leave
the ramp.

Where the design file and the repository disagree on pale lime — `#f1f89a`
against `#f1ff89` — the value above settles it, and the design file is
corrected (§7).

#### Danger and time are two colors, not one

**Red is what went wrong or what will be lost. Amber is what is running out of
time.**

| Token                | Value     | Where                                      |
| -------------------- | --------- | ------------------------------------------ |
| `--color-red-danger` | `#ff5d6b` | The fill of a destructive action           |
| `--color-red-ink`    | `#c9182b` | Error text, the border of an invalid field |
| `--color-amber-100`  | `#ffebbd` | Three days out                             |
| `--color-amber-200`  | `#ffd572` | Two days out                               |
| `--color-amber-300`  | `#ffb914` | The day itself                             |

An exam tool shows _time is short_ constantly and _this cannot be undone_
rarely. One color for both means the rare one is read as the constant one, and
the rare one is the one that matters.

Amber is numbered because it really is a scale: the three steps are `#ffb914`
with white mixed in at 72%, 40% and none, so hue holds at 42 and lightness is
the only thing that moves. Red is not a scale — it has two jobs — so it is
named by them, which is the same rule the brand colors follow.

#### Danger overrides the lime rule

**A destructive action is red, not lime, and this is the only place the rule
bends.**

Pressing the wrong thing here cannot be undone, and that outranks a consistent
palette. The exception is written down so the next one has to be argued
instead of assumed.

Near-black text goes on the red fill (6.4:1). White on it is 3.0:1 and does
not pass, which is what the delete button carries today.

**The fill color is never the text color.** `#ff5d6b` as text on white is
2.99:1. Error messages take `--color-red-ink` at 5.75:1, and so does the
border of a field that failed validation — the same division blue makes
between `sky-status` and `sky-ink`.

#### Gray is ink, and surfaces are not gray

**The gray scale colors text, icons and lines. The three surfaces have their
own names.**

Two of the surfaces used to be the two lightest gray steps, which gave those
values two rules at once — a step in a scale and a level in §2's surface
system — and the two do not move together. Surfaces are now `--color-canvas`,
`--color-surface` and `--color-well`, and gray means ink.

| Token              | Value     | L\* | Job                          |
| ------------------ | --------- | --: | ---------------------------- |
| `--color-gray-100` | `#dfe0df` |  89 | Dividers and borders         |
| `--color-gray-200` | `#c1c1c1` |  78 | Disabled text, decoration    |
| `--color-gray-300` | `#a3a3a3` |  67 | —                            |
| `--color-gray-400` | `#868686` |  56 | An icon that carries meaning |
| `--color-gray-500` | `#6a6a6a` |  45 | Text that recedes            |
| `--color-gray-600` | `#505050` |  34 | —                            |
| `--color-gray-700` | `#373737` |  23 | Body                         |
| `--color-gray-800` | `#1f1f1f` |  12 | Headings and emphasis        |

Eight steps, 11 apart in L\*. The spacing is not arbitrary: it is the distance
between the two thresholds the scale has to hit, so both land on a step rather
than between two. `400` is the lightest step that clears 3:1 for a meaningful
icon on all three surfaces, and `500` is the lightest that clears 4.5:1 for
text on all three.

**One receded step, not two.** The 4.5:1 line sits at L\* 46.6 on the well,
48.6 on the canvas and 49.8 on white — within three of each other. A step
below all three clears all three, so the pair the scale used to carry for this
one job collapses into `500`.

`300` and `600` have no job. They are positions on the ladder, kept because a
ladder missing its middle stops being one; reaching for either needs a reason.

#### Gray has no tint

**Every step is a pure neutral.**

Warm ink was the alternative and it had an argument: the canvas is warm (Lab
b +1.66) and a warmer gray would tie the page together. Neutral wins because
the warmth belongs to the paper rather than the writing. The canvas and the
highlight carry it; ink that stays neutral does not shift when the surface
behind it changes, and it never competes with lime, which is a warm yellow.

The tint is fixed across every step, which is the part that is not optional.
Today it drifts — b is −0.01 at the lightest step and −6.60 at the darkest —
so the scale reads as one color at the top and another at the bottom, the same
failure the old lime ramp had.

#### Known cost

**Completed and pressable share a color.** A checked box is lime and so is the
button beneath it, so the difference between what is done and what is left
cannot be carried by color. Strikethrough and a receded gray carry it instead.

**Lime is common now.** Every button has it, so ranking two buttons on one
screen cannot use color either; fill against outline, size and position have
to do that, and §4 settles them. The signature is a constant rather than an
accent, which is the price of a rule nobody has to interpret.

**Nothing the product reports is lime.** A screen that only shows results has
no signature color on it at all.

**Every gray in the product changes.** None of the twelve old steps survives:
the spacing was uneven, two of them were surfaces under another name, and the
tint drifted. The values here replace all of them at once.

**The pressed state is quiet.** 8% and 16% black are ΔL\* 6.7 and 7.0 apart,
about half the jump the old ramp made. Keeping the hue was worth more than
making the change loud, and a control under a cursor has its cursor as well.

### Depth & Elevation

**Two shadows, because a thing can float at most twice.**

| Token           | Value                                                        | What floats this way                          |
| --------------- | ------------------------------------------------------------ | --------------------------------------------- |
| `--shadow-far`  | `0 2px 6px rgb(0 0 0 / 0.05), 0 18px 40px rgb(0 0 0 / 0.12)` | Over the page: modal, chat dock               |
| `--shadow-near` | `0 1px 2px rgb(0 0 0 / 0.05), 0 4px 10px rgb(0 0 0 / 0.07)`  | Over one of those: dropdown, popover, tooltip |

The count is not a matter of taste. **The number of shadows equals the number
of times something can be stacked.** One thing floats over the page, and one
small thing floats over that; nothing floats over a third time. The deepest a
screen goes is page → modal → dropdown, so two shadows describe every case
that can occur.

A tooltip is not a third level. It is small and anchored like a dropdown, so
it takes `near` and may overlap one without adding depth.

**When a third layer seems necessary, the modal becomes a page.** A flow deep
enough to need one is a flow, and a flow has a URL. This keeps the rule from
being the thing that bends.

#### Shadow is the only thing that separates white from white

A dropdown opened inside a modal is white on white. Fill cannot separate them —
Surfaces (§2) has one value for a raised surface, not two — so the shadow is
carrying the whole difference there. That case sets the floor for how light
`near` may go.

There is a lot of room above that floor. A plain `rgb(0 0 0 / 0.03)` already
reads as ΔE 2.80 against the canvas, past the 2.35 that separates canvas from
surface. `near` peaks at ΔE 10.2 and `far` at 14.4 — several times the surface
step. If the screen ever feels heavy, these come down before anything else
does.

#### Shadow does not encode stacking order

`z-index` order and the dim behind a modal already say what is on top, and an
occluded thing is visibly occluded. A shadow that repeated that would be a
second channel for a message already delivered — the same reason §3 keeps
weight away from pressability. `far` and `near` say how far a thing is from
the page, not which is in front.

> **Undecided.** What a shadow does on a dark surface. `FormModal` is drawn
> dark (`gray-900`) while `Modal` is white, and §2's surfaces are all light, so
> the dark modal has no level here and `far` may mean nothing on it. Settled
> with the modal itself in §4.

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

**A screen arranges components. What a component looks like is the component's
own business.**

The line is the same question §2 asks of color: **can it be pressed, or does it
take a value?** If either, it is a component and comes from `shared/ui`.
Everything else — the boxes, the columns, the gaps between them — is the
screen's, because arrangement is what a screen is.

| The screen draws                         | The component provides                                          |
| ---------------------------------------- | --------------------------------------------------------------- |
| Arrangement — `div`, flex and grid, gaps | Anything pressable — button, tab, checkbox                      |
| Meaning — `h1`–`h6`, `p`, `ul`           | Anything that takes a value — field, select, date               |
| —                                        | Anything with a shape of its own — card, badge, progress, modal |

#### A caller does not restyle a component

**No `className`, no `style`, on anything from `shared/ui`.**

A component that accepts arbitrary classes has no settled appearance; it has a
default that any screen may disagree with, and the disagreements do not meet
each other. What a caller genuinely needs becomes a prop, which means it is
named, reviewed once, and available to every other screen with the same need.

The alternative — allow the override but guarantee the caller wins — keeps the
door open, and a rule with a door is the state this document was written to
leave.

**The cost is deliberate.** A layout need that has no prop stops the work until
a prop exists. That pause is the mechanism, not a side effect: `shared/ui`
changes travel as their own reviewed change, so the pause is where the
conversation happens rather than where it is skipped.

Counting what callers override today shows what the props actually have to be,
and it is a short list. Of the overrides in place, most are not requests at all
— a button asking not to shrink, a checkbox asking for a weight §3 already
settles. Those are the component's own bugs, being patched from outside. The
ban surfaces them.

#### Rules that are not enforced are comments

Every rule above is checked by `eslint.config.mjs`, alongside the removal of
the framework's default palette (§2). A rule the build does not check is a
sentence people read once, and this codebase already ran that experiment:
`CLAUDE.md` asked screens to reuse `shared/ui`, and 66 buttons were drawn by
hand anyway.

### Catalogue

> **Undecided.** Fields, cards, badges, selects and modals. What follows settles
> the button family only.

#### The button family is three components

**`Button`, `IconButton`, `Toggle`.** Forty-seven of the sixty-six buttons drawn
by hand are one of the three.

| Component    | What it is                                  | Contract              | Today |
| ------------ | ------------------------------------------- | --------------------- | ----: |
| `Button`     | Carries a label; pressing it does something | `children` required   |    28 |
| `IconButton` | The same, with no label                     | `aria-label` required |    13 |
| `Toggle`     | Carries a pressed state of its own          | `pressed` required    |     6 |

The line between them is not size and not appearance. It is what each one owes
the screen reader: a control with no text needs a name given to it, and a
control that stays pressed needs `aria-pressed` or its state is never read at
all.

Both could be props on a single component, and props are exactly what gets left
out. All thirteen unlabelled buttons in the codebase happen to carry an
`aria-label` today, which is luck rather than a rule — the rule has never been
checked by anything. Putting it in the type signature is how it stops depending
on who wrote the screen.

`Toggle` knows only whether it is pressed. Whether pressing one releases its
neighbors — a tab strip, a page number — is arrangement, and arrangement belongs
to the screen. One component therefore serves the viewer's tabs, where several
are open at once, and pagination, where exactly one is.

#### Nineteen of the sixty-six are not buttons

| Drawn by hand today          | Count | Where it goes                                |
| ---------------------------- | ----: | -------------------------------------------- |
| A card or row, pressed whole |     9 | `Card`, inside the feature's own component   |
| A dropdown trigger or option |     5 | The select family — not settled here         |
| Back, and other navigation   |     3 | A destination makes it a link, not a button  |
| Social sign-in               |     1 | Kakao yellow and Google white sit outside §2 |
| The audio scrubber           |     1 | It takes a value: `input type="range"`       |

These are `<button>` because `<button>` is what takes a click, not because they
are buttons. Keeping them out is what keeps the three above small — a component
that has to serve a card, a select and a scrubber has no shape left of its own.

#### What this removes

`FormModal` exports two class strings, `PRIMARY_ACTION` and `DANGER_ACTION`, and
three modals import them onto a hand-drawn `<button>`. Both go. A shared class
string is a component's appearance with none of its behavior: every caller still
writes `type`, `disabled` and focus handling again, and they already disagree.

#### A second action is a border, not a fill

**Primary is a lime fill. Second gives up the fill and takes a border. The gray
fill belongs to disabled, and to nothing else.**

| Rank        | Fill       | Border     | Label      |
| ----------- | ---------- | ---------- | ---------- |
| `primary`   | lime       | —          | `gray-800` |
| `secondary` | `surface`  | `gray-100` | `gray-700` |
| `danger`    | red        | —          | `gray-800` |
| disabled    | `gray-100` | —          | `gray-400` |

§2 leaves rank only one color to work with. Lime is the fill of anything
pressable, and an interactive label with no fill behind it takes no color at
all — so a second action can be neither a paler lime nor blue. Gray is what is
left, and disabled already holds it.

Handing gray to both is what the design file does. A form modal's footer then
carries a cancel and a disabled save on the same gray surface, ΔE 0 apart, the
disabled label at 1.36:1. One of the two can be pressed and nothing on the
screen says which.

So gray stays with disabled, and second rank gives up the fill rather than the
color. The border then carries the whole signal, and it is thin — `gray-100` on
`surface` is ΔE 10.9. That thinness is the cost, taken over the alternative of
dropping the border as well: a second action with neither fill nor border has
the same shape as the sentence beside it, and only its position would say it
can be pressed at all.

Disabled labels sit at 2.75:1, below the 4.5:1 the rest of the system holds to.
A disabled control is exempt, and buying the contrast back would mean darkening
its label toward the enabled one, which is the collision this rule exists to
prevent.

**`dark` goes.** Five buttons are filled near-black today. Pressable is lime; a
near-black fill is a second signature nobody chose. The landing page keeps its
own, because §3 already puts the landing outside the ramp.

#### Height waits for the screen

> **Undecided.** How many heights a button has, and what they are.

A button's height is not the button's own. It is read against the field beside
it and the row it stands in, which is why §2 puts buttons, fields and tabs on
one list instead of giving each its own. That list is a pool of legal heights,
not a ramp any single control has to walk — nothing in it says a button has
five sizes.

The design file offers two clusters: 60, across six different widths, and 44,
across six more. 40, 46 and 52 drift between them, and 76 and 80 appear on the
auth screens alone. Two sizes is the plausible answer, and plausible is exactly
what §7 says not to write down. What would settle it is balance — how a button
sits against the field above it — and balance is a property of the screen, which
§5 has not drawn.

**The pool itself is owed a second look.** Of its five steps only 44 carries a
reason here, and the design file's most common button height, 60, is not on the
list at all.

### States

> **Undecided.** Loading, empty, error and disabled are required, not optional:
> transcription and AI summarization are asynchronous and the UI polls
> `READY`/`PROCESSING`. Their appearance is not yet settled.

---

## 5. Layout & Platforms

### Layout Principles

**The product is drawn for the desktop.** Every screen assumes a wide viewport
and a pointer.

The study screen is why that holds rather than being a convenience. It sets the
lecture material beside its summary, and the material is a PDF — a document of
fixed proportions, which does not reflow as its column narrows, only shrinks. A
screen built on that pairing does not become a narrow version of itself; it
becomes a different screen, with different decisions behind it. The design file
agrees by omission: of its 62 top-level frames, 51 are 1920 wide and none is a
phone.

This is a decision about the phase, not a claim about the product.

> **Undecided.** The landing page gets a phone version later. It is the one
> screen read before anyone signs in, and §3 already sets it outside the type
> ramp for the same reason.

### Responsive Behavior

**Text and controls hold one size across the whole desktop range. Containers
that belong to the viewport follow it.**

| What                                     | How                                                         |
| ---------------------------------------- | ----------------------------------------------------------- |
| Type, control heights, component insides | The design px, at every width                               |
| Content column, modal, side panel        | The ratio measured from the design, capped at the design px |

A laptop is not a narrow desktop. Between 1280 and 1920 the reader has not
changed and neither has the reading distance, so 18px that was right at one
width is right at the other. What changes is how much room the page has, and
room is what a container is for.

**A step was considered and dropped.** Shrinking type below a threshold is the
obvious way to keep the design's proportions at a narrow width, and it fails on
cost: every step of §3's ramp would carry a second value, chosen every time the
first one is. §3 is built on one value per size, and it says so about the
landing page for the same reason.

**The cost is that proportions drift.** A column narrows while the button and
the label inside it do not, so at 1280 a component takes a larger share of its
column than the design file shows. That is the price of not shrinking text, and
it is the right way round: text that stays legible beats a layout that matches
a screenshot.

**This does not govern composition.** A column narrow enough to fold — dropping
a scrubber, truncating a label — is a layout change, not a size change, and it
is measured against the column rather than the window. The viewer already works
this way, because a panel inside a split screen can be 340px wide while the
window is 1920 and a media query cannot see the difference.

> **Undecided.** The narrow end of the range. It is the width at which the study
> screen's split stops working, and that is a number to take off a screen rather
> than pick.

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
