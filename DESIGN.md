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

| Level   | Token             | Value     | Use                                     |
| ------- | ----------------- | --------- | --------------------------------------- |
| Canvas  | `--color-canvas`  | `#fcfaf7` | Page background                         |
| Surface | `--color-surface` | `#ffffff` | Cards, panels, modals, menus            |
| Well    | `--color-well`    | `#e9e9e9` | Recessed areas: search field, PDF stage |

Beside them, outside the ladder:

| Token           | Value     | Use                |
| --------------- | --------- | ------------------ |
| `--color-frame` | `#f3f1ee` | The sidebar's rail |

Borders are not the default separator. Shadow is used **only** on surfaces that
float above the page — modal, dropdown, tooltip — never on cards in a list.

**Known cost.** Canvas to surface is ΔE 2.35 (ΔL\* 1.65), barely past the
threshold where a difference registers. Soft card edges are the deliberate
choice: a quiet screen over a crisp one. Canvas to well is ΔE 6.23, over twice as
large, so the ladder is uneven by acceptance, not by oversight. If card edges
ever need strengthening, deepen the canvas rather than add borders — that keeps
fill as the single mechanism.

#### The frame is beside the ladder, not a fourth rung

**`frame` is the rail's ground and nothing stacks on it**, so it never has to
answer the question the three levels exist to answer. A card on `canvas` rises
to `surface`; on a `surface` panel it sinks to `well`. Nothing rises on the rail
— its active item is a lime fill and its avatar is a border — so the rail can
have a fill of its own without making the ladder four deep.

It is the canvas's own color with the lightness taken down, from L\* 98.3 to
95.05. That point is where the two distances are largest at once: ΔE 3.13 from
`canvas` and 3.33 from `well`, both past the 2.35 where a difference registers.
Below `well` the gray ramp would have to come down with it, so the value sits
above.

#### `well` stopped being a ground, and that was a bug fix

**A recessed area holds content, not controls.** `well` was named for a search
field and then given to the study viewer's panel, and a panel is a ground —
buttons, toggles, cards and bare text all sit on it.

That broke hover. A control resting on `surface` shows hover by darkening, and
§4 sets the step at 8% black, which over white is `#ebebeb` — **ΔE 0.70 from
`well`**. On that panel the page toggle turned exactly the panel's color and
disappeared. Measured: `rgb(233,233,233)` against `rgb(233,233,233)`.

The panel could not simply go darker. At L\* 92.3 `well` is already at the
ramp's edge — `gray-400` reads 3.04:1 against the 3:1 it has to clear and
`gray-500` reads 4.52:1 against 4.5:1 — so one step down breaks icons and text
together. Nor could it go lighter, which is what deepening it fixed in the first
place.

**So the panel moved up instead.** The viewer's panel is `surface` with a
`gray-100` border, its PDF stage is `well`, and the rows on it sink to `well` —
the ladder read exactly as written. `well` keeps the places where nothing is
pressed.

**The cost is that a second-rank control resting on that panel is ΔE 0 from it**,
carried by a `gray-100` border at 1.35:1. §4 already took that thinness as the
price of giving up the fill; on a white panel the border is the whole signal
rather than most of it. Accepted, and recorded here so the next reader knows it
was a choice.

**A thing that sits on a surface cannot use that surface's own fill.** There are
three levels and no more, so what a card does depends on what is under it: on
`canvas` a card rises to `surface`; on a `surface` panel it has nowhere to rise
to and sinks to `well` instead. The study viewer found this the hard way — white
cards on a white panel measured 1:1, which is a card that is not there. Its
panel is now `well` and the rows rise to `surface`, which is the same ladder read
from the other end.

**The same shortage reaches `sky-pale`.** It is named above for a progress track,
and that assumes the track sits on white. On a `well` panel it is ΔL\* 3.8 from
the ground and disappears; there the track takes `gray-100` and the fill carries
the state alone.

**Deepening a surface pulls the gray ramp down with it.** The two thresholds
below are measured against the darkest of the three surfaces, so `well` and the
ramp move together or not at all. Well went from `#f0f1f1` to `#e9e9e9` for the
PDF stage — white paper two steps from its ground is hard to see as paper at all
— and every gray step followed by one or two hex units. `frame` sits above
`well` for the same reason, which is why the rail could not simply be a darker
cream.

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

#### A subject keeps one color, and there are eight of them

**A subject is told apart by color, and the color belongs to the subject.**

| Token               | Value     |  L\* | On white |
| ------------------- | --------- | ---: | -------: |
| `--color-subject-1` | `#b04852` | 44.9 |   5.39:1 |
| `--color-subject-2` | `#be7d42` | 58.0 |   3.39:1 |
| `--color-subject-3` | `#66701b` | 44.9 |   5.39:1 |
| `--color-subject-4` | `#399d68` | 58.0 |   3.39:1 |
| `--color-subject-5` | `#007d84` | 47.4 |   4.92:1 |
| `--color-subject-6` | `#0099d4` | 59.5 |   3.23:1 |
| `--color-subject-7` | `#5466b3` | 45.1 |   5.35:1 |
| `--color-subject-8` | `#c26fae` | 57.9 |   3.40:1 |

The set is built, not picked: hue steps by 45° around the circle and lightness
alternates between two steps. Both moves are load-bearing.

**Hue alone would fail the people it matters most to.** Eight colors at one
lightness are eight greys to anyone who cannot separate the hues; simulated for
deuteranopia the closest pair falls to ΔE 9.6 with the lightness split and would
be far nearer without it. This is §2's own rule applied to itself — colors that
must be told apart differ in lightness, not hue alone.

**Eight, because eleven does not fit.** At eleven the hue step is 33° instead of
45, and holding that apart under a color vision deficiency needs more lightness
steps, which pushes some of them past the 3:1 a dot has to keep. Eleven was a
count of subjects a person might have, not a count the screen can carry. Beyond
eight the palette repeats; two subjects sharing a color is a smaller failure
than eleven nobody can separate.

**The color is stored on the subject.** Today it is computed from creation
order — `SUBJECT_DOT_CLASSES[map.size % 11]` — so deleting one subject shifts
the color of every subject after it. The file's own comment says a subject that
changes color between screens defeats the point; a subject that changes color
between weeks defeats it the same way. This is a field the backend has to keep.

**Where color is doing the work is the calendar.** A cell holds two events
before it folds the rest into `+N`, and there is no room for a subject's name —
`컴퓨터네트워크` and `컴퓨터구조` both truncate to `컴퓨터`. In the sidebar the
name is already beside the dot, so the dot there is reinforcement rather than
the message; the calendar is what the palette exists for.

#### The two level colors are removed

**`--color-level-01` `#f0abff` and `--color-level-02` `#ffde65` leave the
system.** Nothing replaces them.

They were a three-step scale for a chapter's study state, and `level-03` was
already removed from it for being the lime under a second name. §4 then replaced
that state with a count, so the scale has nothing left to step through.

They could not have stayed in any case. On a light surface `#f0abff` is
**1.75:1** and `#ffde65` is **1.32:1**; text needs 4.5 and a border needs 3. The
shared tag draws both its label and its border in a color that clears neither,
beside a `D-3` tag on the same line that clears 4.6.

| Where it was used                | What it becomes                        |
| -------------------------------- | -------------------------------------- |
| The `IN_PROGRESS` button fill    | Gone — §4 removed the button           |
| The shared tag's text and border | Gone — sharing is out of scope         |
| The download button's gradient   | An ordinary second action, so a border |

**Sharing is out of scope, so its tag goes with it** — and §4 had already retired
`Tag` entirely, which is the stronger reason: its seven tones drew names, counts
and deadlines alike, and that work becomes text.

Had sharing stayed it would still not have taken a color. **There is no cell for
it in §2's table of roles** — lime is what can be pressed, blue is what informs,
red is fault or loss, orange is time. Sharing is not a state; it is a fact about a
lecture, and a fact is carried by the word for it.

Darkening them instead was considered and it collides. To carry text they need
L\* near 45, and the pink at that lightness is `#c26fae` — subject 8. Yellow
lands on subject 3's neighbourhood the same way. The subject palette steps hue by
45° all the way round, so there is no gap to move into, and §2 removed `level-03`
for being one value under two names.

**The gradient's reason disappears twice over.** Its component exists because the
summary panel is dark — "어두운 패널 위에 올라가서 shared/ui의 Button variant와
색 역할이 달라" — and §2 abolished dark surfaces. Its colors are these two. Both
halves of the argument for it are gone at once.

**Color is now closed.** Every color in this section has a role, and no role is
waiting for a color.

#### The decorative wash borrows two colors and takes no role

**The mesh behind the landing, the home banner and the chat dock is lime and blue
laid on at a fifth of their opacity and below.** It is the only place a color
appears with no role attached, and the way it stays harmless is that it never
carries an edge, never reaches a fifth of its own opacity except at its single
strongest stop, and sits behind everything.

It did not need tokens of its own. The design paints it `#E9FC47 → #7FDEF7` —
which were `primary-300` and `secondary-300`, two steps this section replaced.
Refitting the alpha, `lime-action → sky-status` reproduces the design's own export
to **mean ΔE 1.85** — the same figure the design's own two colors reach at their
own best fit. They stop in the same place because at a fifth of an opacity what
survives is hue, and the two pairs differ in lightness, so the pair that already
has a role wins. The pale pair cannot take the job: refitting it as far as it
goes leaves **2.87, with a 95th percentile of 9.2 against 5.1** — it has already
spent its saturation on lightness, and there is no alpha that buys hue back.

**What differs between the three places is the angle, not the shape.** The design
draws one wandering path, fills it with a linear lime-to-blue gradient, and blurs
it by 78 — and the blur eats the shape. Projecting the banner's export onto its
own gradient axis leaves color a function of that one coordinate (spread within a
coordinate: 13–23 of 255) with nothing left across the other. So a place needs an
axis and a set of stops, not a drawing, and because the stops are percentages the
same wash sits in a 839×198 banner and a full-height hero without being re-placed
by hand.

**A place may take more than one blob, and the extra ones are faint.** The banner
has two: the sweep, and a second at the left edge whose own path lies almost
entirely outside the box, so only its far edge lands. At a third of the sweep's
strength (coverage 16 against 48) and with no direction left to read, it is a
circle rather than an axis. Measured against the export, the two together reach
**mean ΔE 1.83, 95th percentile 4.6**; the sweep alone reaches 2.60. The
remainder is the vertical falloff a linear sweep cannot carry, on a panel whose
whole range is ΔE 12 from white.

**Interpolation is pinned to sRGB.** Tokens leave the build as `oklab()`, and a
gradient between two of them interpolates in oklab unless told otherwise, which
pushes the 95th percentile from 4.6 to 8.4. The values live in `globals.css` as
one utility per place, because they are colors and colors belong beside the
tokens they are made of.

#### A subject's color is a bar beside a name and a circle standing alone

**In the calendar the color is a bar, 3 wide and as tall as the line of text it
sits beside. In the sidebar it is a circle, 10 across, in both the open rail and
the collapsed one.**

The shape is not chosen per screen. It follows one question: **does the color
have a name beside it, or is it the only thing there?**

A sidebar item collapses to the color alone — the rail is 90 wide and the name
fades out. A 3px bar with nothing next to it is a sliver with nothing to align
to; a circle is a complete shape that reads as a deliberate mark at a glance
down a list. And because the same item has to survive the rail opening and
closing, it keeps that circle when the name comes back rather than changing
shape on a toggle.

A calendar event always has its name with it and never collapses, so the color
can be a bar — and in that cell a bar is better than a dot on both counts at
once. **It is larger and it costs less width.** At a 1440 viewport the cell is
78.6 wide (content column 1114.7, calendar column 616.4, then the card's padding
and the grid's gaps), leaving 66.6 inside it. A 6px dot with its 6px gap takes 12
of that and covers 28px²; a 3px bar with the same gap takes 9 and covers 48px².
The name gains three pixels and the color gains twenty square ones.

**A filled chip was rejected by §2's own palette.** Small text needs 4.5:1, and
on these eight colors white clears it on 1, 3, 5, 7 only while near-black clears
it on 2, 4, 6, 8 only — so a chip would carry two text colors, decided per
subject. The lightness alternation that makes the palette survive a color vision
deficiency is the thing that breaks the chip. Colored text fails for the same
reason and in the same halves.

**Both values are off every ramp in this document, and that is correct.** A
color marker is neither type nor spacing nor an icon, so §2's and §3's lists do
not reach it. What fixes them is the two states: the bar's height is the text's
line box, and the circle's 10 is the smallest that is still findable when it is
the only thing in the rail.

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

Near-black throughout this section is `gray-800`, the darkest step the scale
has. It is named here because the figures below were first computed against a
darker step that the scale no longer carries.

On the canvas lime is 1.09:1 — not faint, absent. With near-black text on it
lime is 14.7:1, the strongest pair in the system.

So lime is not a color that fails as text; it is a color whose place is the
fill. Text, icons and links are never lime. An interactive label with no fill
behind it takes no color at all — position, cursor and shape carry that, the
same division §3 relies on for weight.

Blue does both, but not at the same step. `#4dd8ff` is a fill and takes
near-black text (10.0:1). `#0475b9` is 4.74:1 on the canvas and 4.94:1 on a
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
| `--color-amber-100`  | `#ffebbd` | Two weeks out — D-14 to D-8                |
| `--color-amber-200`  | `#ffd572` | One week out — D-7 to D-4                  |
| `--color-amber-300`  | `#ffb914` | The last three days — D-3 to D-DAY         |

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

Near-black text goes on the red fill (5.6:1). White on it is 3.0:1 and does
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
| `--color-gray-100` | `#dedede` |  88 | Dividers and borders         |
| `--color-gray-200` | `#bfbfbf` |  77 | Disabled text, decoration    |
| `--color-gray-300` | `#a1a1a1` |  66 | —                            |
| `--color-gray-400` | `#858585` |  56 | An icon that carries meaning |
| `--color-gray-500` | `#696969` |  44 | Text that recedes            |
| `--color-gray-600` | `#4f4f4f` |  34 | —                            |
| `--color-gray-700` | `#363636` |  23 | Body                         |
| `--color-gray-800` | `#1e1e1e` |  11 | Headings and emphasis        |

Eight steps, 11 apart in L\*. The spacing is not arbitrary: it is the distance
between the two thresholds the scale has to hit, so both land on a step rather
than between two. `400` is the lightest step that clears 3:1 for a meaningful
icon on all three surfaces, and `500` is the lightest that clears 4.5:1 for
text on all three.

**One receded step, not two.** The 4.5:1 line sits at L\* 44.4 on the well,
48.4 on the canvas and 49.6 on white — within six of each other. A step
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

#### One dim, at 45%

**`--color-dim` is `rgb(0 0 0 / 0.45)`.** It is the layer between the page and
whatever floats over it, and it has one value because it has one job.

It is set against the panel it stands behind rather than picked for darkness.
Black at 45% puts the canvas at L\* 57.5, which is 3.45:1 against a `surface`
panel — the lightest step that clears 3:1, since 40% lands at 2.96. Below that
line the panel's edge is carried by `far` alone, which is a job the shadow
already has; at 45% the dim says it as well, so a screen that cannot draw the
shadow still shows where the modal begins.

The value this replaces is 50%, and it was chosen when the modal was `gray-900`.
A dark panel separates itself and the dim only had to darken the page behind it.
With the panel light the dim carries the separation — but not more than that. At
60% the page falls to L\* 42.4 and every open and close swings the whole screen,
which is felt in a flow that opens the same modal again and again.

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

#### There is no dark surface

**A modal is `surface`, like every other floating panel.** The design file draws
the form modal dark, and it becomes light.

The same question was already answered for the screen with more riding on it:
the design draws the study view as two dark panels, and §2 took the light canvas
instead, because the PDF beside them is white paper and students read the pair
for hours. A modal is looked at for less time, but it belongs to the same three
surfaces, and a fourth would arrive carrying its own shadow levels and its own
gray scale — every contrast figure in this section assumes ink on a light
ground.

So `far` and `near` never land on a dark ground, and the level a dark modal
would have needed does not have to exist.

**The last exception was the rail, and it is gone.** §5 described it as dark
while this section said no dark surface exists; the rail now takes `frame` and
the sentence holds with nothing to except. The tooltip went with it — it was
`gray-900`, and §4 assigns it the `near` shadow, which is computed for a light
ground.

**The cost is a redraw, not a reclass.** The form modal is dark throughout:
`gray-900` panel, `gray-800` fields, `gray-700` popovers, light text on all
three. Every one of those inverts, and the fields land on `well` — which is what
the rest of the system already does with a recessed area.

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

Control height is not drawn from the spacing list, because the two are read
differently. Spacing is read as a ratio — the steps above skip 28, 36, 44, 56 and
72 for that reason — while a control's height is read against the text inside it
and the control beside it, which is an absolute. Two of the five steps here, 44
and 56, are values the spacing list deliberately leaves out. One shared list
would have to drop both.

The minimum target size does not pick any of these. WCAG 2.5.8 sets 24×24, and
the smallest step here is 32, so the standard is a floor this list already stands
above rather than a reason for a step on it. 44 is not here because it is safe to
tap; what it is for is settled in §4.

#### Scroll areas

**Everything that scrolls inside the page — a card, a panel, a modal body, the
sidebar rail — uses one part, and the page itself is left to the browser.**
`shared/ui/ScrollArea` takes the native bar out of the layout, closes the bottom
with a fade, and draws its own 6px bar that appears while scrolling or while the
pointer is over the area, and can be dragged.

The native bar could not stay. In Blink a classic scrollbar takes its 6px out of
the layout the moment it appears, so the content shifts every time a list grows
past its box — in the rail that shift was the lime pill going 8 left and 14
right. Hiding it per screen was the other option, and it produced four different
treatments: a bar with a track, a bar without one, a hand-drawn gradient over a
hidden bar, and a hand-drawn bar. Two of those utilities turned out to render
identically to the default.

**Padding belongs to the content, not to the scrolling box.** The bar sits on
the right edge of the area, so anything padding the box pushes text under the
bar or the bar off the edge — every call site that had tried to solve this had a
different negative margin. With the padding inside, the bar stands over it.

The page's own scrollbar is not this part. A fade across the bottom of the
viewport would sit over the product permanently, and the browser's bar is the
one thing on screen the product does not own.

#### Corner radius

| Step   |  px | Where                                                          |
| ------ | --: | -------------------------------------------------------------- |
| `md`   |   6 | Every rectangle — controls, cards, panels, modals, small marks |
| `full` | 999 | Pills and circles — see below                                  |

**Two steps, and the second one is a shape rather than a size.** There were
four: 4 for small marks, 6 for controls, 10 for cards. The two that went were
answering a question the product does not ask. A corner of 10 on a 654px card
against 6 on the button inside it is a difference nobody reads as a rank, and
between 4 and 6 on a tag there is nothing to read at all — but every new
rectangle had to be classified against all three before it could be drawn.

**What the corner stopped saying, the fill already said.** §2 gives pressable
things lime and §4 gives a second action a border; a card carries a resting
border because `surface` on `canvas` is ΔE 2.35 and needs an edge. None of those
signals was ever carried by the radius, so removing two steps removes a decision
without removing a distinction.

The cost is real and it is small: a card and the button inside it now share a
corner. That reads as one material rather than as two, which is what a card and
its contents are.

`full` makes two different shapes and only one of them carries meaning. **Among
things that can be pressed, a pill is a control that holds a state**, which is
what separates a lit toggle from a button in the same color (§4). A circle is the
shape of a thing that is already round — an avatar, an icon with no label — and
says nothing about state.

**A value that cannot be pressed reads the corner the other way, and one does.**
Every rectangle in the product is now 6, and 6 is what a button is — so a small
rectangle carrying a fill is a small button. The exam countdown is the one
non-interactive value in the product with a fill of its own (§4 leaves exactly
one badge standing), and at 6 it read as something to press. It takes `full`.

This does not weaken the sentence above it. The collision that rule exists to
settle is between a lit toggle and a confirming button — both `#e3ff00`, both
pressable, told apart only by the corner. The countdown is amber and inert, so it
was never in that comparison. What the corner means is read together with
whether the thing can be pressed at all, which the cursor and the element
already say.

Three steps are gone from the stylesheet, and for one reason: `xs` at 3px was in
no design and used nowhere, while `sm` and `lg` were used and still said nothing.
A step nobody needs is a step everyone has to rule out.

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

**Two durations, 150 and 300, and one curve, `ease-out`.**

| Duration | What takes it                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| **150**  | Things that change in place — fill, text color, opacity, shadow, a toggle's knob                             |
| **300**  | Things that change position or size — the rail and the content it pushes, a panel sliding in, a progress bar |

The count is the rule, the same way §2's two shadow levels are. **Two durations
means two kinds of change, and a third value would mean a third kind nobody can
name.**

**200 is removed, and it is the value that proves the point.** Its three uses are
all one motion — the rail's width and the padding of the content beside it — but
the names inside that rail transition at 150, so the labels finish before the
rail they sit in. A value chosen with no rule behind it splits a single movement
into two times.

**The rail and the content it pushes share one value because they move the same
distance.** The rail opens from 72 to 216, so the content moves 144; two numbers
for one displacement is the 200 mistake again.

**The names in the rail get no transition of their own.** They arrive with the
rail. This is the better fix: matching two numbers keeps them in step, and
removing one of the two makes being out of step impossible.

**One curve, and it is `ease-out` in both directions.** `ease-in` on something
leaving starts it slowly, and a thing that has been asked to go and has not yet
moved reads as a screen that did not hear the click. The same curve arriving and
leaving is also one value instead of two.

**Motion that does not end stops under `prefers-reduced-motion`.** There is one
such motion in the product — §4's pulsing bolt — and it has no such guard today.
The landing page's drifting background is on the surface §6 put outside this
document. The one-shot transitions above stay on: they are state changes rather
than movement, and turning them off makes the interface jump rather than calm it.

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

#### A title takes one of three steps, and each step has one job

**32 names the screen, 24 names a modal, 20 names a card or a panel.**

| Step | Token        | What it titles                                |
| ---: | ------------ | --------------------------------------------- |
|   32 | `heading-md` | The screen                                    |
|   24 | `heading-sm` | A modal                                       |
|   20 | `body-md`    | A card, a panel, a section                    |
|   18 | `body`       | Not a title — body text, and the `xl` control |
|   16 | `body-sm`    | Text inside a card                            |
|   14 | `label`      | Metadata, and every button                    |

**24 was doing three of these jobs at once.** It titled four screens, both
modals, and one panel on the home screen — so nothing in the product could be
read as outranking anything else. Moving screens up to 32 leaves 24 to modals
alone, and a modal that outranks every card is right: it is the one thing on
screen when it is open.

**A card title at 20 is what frees 18.** Before this, 18 titled the calendar,
the TODO list and a section heading while also setting body paragraphs, empty
states and error messages — and 20 had no job but a chat bubble. Each step now
answers one question, and none of them is empty.

The same rule fixes a split nobody chose: card titles were 16, 18 and 24
depending on which card, and the three panels on the home screen were 18, 18 and
24 standing side by side.

**Two steps are still open.** `heading-lg` (52) is used nowhere, and `body-lg`
(22) holds three uses that are not titles. Neither is assigned here, and a step
with no job is the thing §2 and §3 have each removed once already.

#### Line height

Body steps (14–24) sit at roughly 1.5. The large headings run tighter — 32 at
1.38 and 52 at 1.42 — because a large line needs proportionally less space
beneath it to still read as one line rather than as a paragraph.

The 4px grid does not govern line height. The grid governs the space between
things, which §2 settles. A line box is not space between things; it is the text
itself. Where the two disagree, reading wins.

**One place sets 14 in a 16 box, and that is the same rule applied.** A calendar
day has 48px under its date, and an event there is a single truncated line, not
a paragraph — three of them at the label's own 22 would need 66. At 16 they fit
exactly, and the ramp keeps its floor: the size stays 14, which is what §3
governs, while the box follows the cell. This is also what fixes the marker,
since §2 binds the bar's height to the line box — 3 × 16. The alternative was
keeping 12px text, and that trades a step on the ramp for two pixels of width.

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

#### An icon is a name, not a file

**Every icon lives in one record, `ICONS` in `shared/ui/Icon.tsx`, and screens
call it by name:** `<Icon name="edit" size={16} />`. There is no other place an
icon may be drawn, and that is a lint rule rather than a sentence — `<svg>` is
forbidden everywhere in `src` except `Icon.tsx` and `Logo.tsx`, the logo being a
wordmark rather than an icon. The previous version of this rule was a sentence,
and the count below is what a sentence was worth.

**The reason is a count.** Before this rule there were 43 icon definitions across
15 files — `icons.tsx` in five features, one in `shared/ui/Sidebar`, and eleven
more written inline in the component that used them. `ChevronRightIcon` existed
five times over, `CheckIcon` and `PlusIcon` three each. Half of the 56 distinct
glyphs were not used at all, and the registry's own `close`, `restart` and
`upload` sat unused beside hand-drawn copies of themselves.

A record cannot hold the same key twice, so the duplication that produced that
count is not expressible. `IconName` is `keyof typeof ICONS`, so a name that is
not in the design cannot be typed. And `IconButton` takes `name: IconName` —
an icon outside the record cannot go in the shared icon button, which is how
screens ended up drawing raw `<button>` around their own SVG.

**Two of the 43 were not duplicates but ghosts.** The sidebar's book was a PNG
and the TODO memo was an SVG file in `public/`, and both had their color baked
in — so neither could follow `currentColor`, and both had been re-drawn by hand
next to the asset that could not be used. An icon that cannot take the text
color of the thing it sits beside is not an icon in this system.

**The record is two records, and the second one is a debt.** `DESIGN_ICONS`
holds what came from the design's icon frame; `LOCAL_ICONS` holds what was drawn
here because the frame has no glyph for it. They merge into one `ICONS` at the
end, so calling code sees a single list — but adding an icon forces a choice
between them, and that choice is the rule: **look in the frame before drawing.**

Today that is 18 against 12. The 12 are not wrong, they are unfinished: `house`,
`book`, `mic`, `paperclip`, `send`, `expand`, `collapse`, `to-top`,
`arrow-upper-right`, `check`, `memo`, `bolt`. When the frame grows one of them,
it moves up. The count going down is the progress.

Entries from the frame carry that frame's cell coordinates as their `viewBox` —
`'20 215 24 24'` is where `arrow-down` sits in the file — so they stay 1:1 with
it, and a `box` whose origin is not `0 0` is how you can tell at a glance which
record an entry belongs in.

**The frame draws one glyph per size, and the registry keeps only the sizes it
uses.** The plus exists there at 16 and at 24, with strokes of 1.30 and 1.50 —
the design holds the stroke near-constant in absolute pixels, so the larger
drawing is proportionally thinner. Both were in the registry as `plus` and `add`
until it turned out that `add`, the 24, was being rendered at 14 in the one place
it was used, putting its strokes on 0.87px. The 24 is gone and the 16 covers
everything from 12 to 20. Fetch a size back from the frame when a screen needs
it, rather than scaling the wrong one.

**Names say the job, not the shape.** `edit`, not `pencil`; `restart`, not
`refresh`; `upload`, not `cloud-up`. Two jobs that happen to share a glyph today
can diverge without renaming every call site, and a screen reads for what it
means. The exceptions are the glyphs that have no job but their direction —
`arrow-up`, `arrow-down` and the two beside them.

#### Removed tokens

| Token       | Was   | Why                                                                                                                                                                                                                                                                                         |
| ----------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button-lg` | 20/28 | Same size as `body-md`. Its one caller is a button whose height comes from the 40px brand icon inside it, so the 28 never applies: measured 500×60 before and after the swap.                                                                                                               |
| `button-sm` | 16/28 | Same size as `body-sm`. Named for buttons, but most uses were paragraphs, headings, hints and badges — 13 of its 15. Moving all 15 to `body-sm` left every fixed-height control unmoved and narrowed the rest from 1.75 to 1.50: the home page came out 4px shorter and nothing re-wrapped. |

A token named after a component starts lying the moment that component stops
being its only user. Size and line height belong to the ramp; a button's height
comes from control height (§2).

#### The landing page is outside the ramp

> **Undecided.** The landing page is pre-login marketing, it opens on phones,
> and it scales its headings with the viewport — which this ramp deliberately
> does not do. Its own scale is not settled, and the current design is a
> placeholder rather than a source. **Nor is it settled that this document
> governs the landing page at all** — §7's Scope holds that question, and it comes
> first.

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

The button family, the two modals, the field, the list the four pickers share,
the badge, the card, the toggle and the icon button are settled below. What is
still open in §4 is the failure slot inside a chapter, named where the states
end.

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
neighbors — a tab strip, a calendar's day — is arrangement, and arrangement
belongs to the screen. One component therefore serves the viewer's tabs, where
several are open at once, and a calendar cell, where exactly one is.

**There is no pagination in the product.** It was named here as the second user
of `Toggle` and it has since gone: the chapter list paged four at a time, which
is the row count §5 forbids a region from picking, and the list now shows every
chapter and lets the page scroll. That also settles a question this section had
left open — a page number needs `aria-current` while `Toggle` emits
`aria-pressed`, and with no page numbers left there is nothing that needs both.

#### Nineteen of the sixty-six are not buttons

| Drawn by hand today          | Count | Where it goes                                |
| ---------------------------- | ----: | -------------------------------------------- |
| A card or row, pressed whole |     9 | `Card`, inside the feature's own component   |
| A dropdown trigger or option |     5 | The select family — not settled here         |
| Back, and other navigation   |     4 | Back goes; the rest become links             |
| Social sign-in               |     1 | Kakao yellow and Google white sit outside §2 |
| The audio scrubber           |     1 | It takes a value: `input type="range"`       |
| A calendar day cell          |     1 | It stays: neither a pill nor a card          |

The day cell is the one that stays hand-drawn. This section names it as
`Toggle`'s second user, and the semantics are right — exactly one day is pressed
at a time, which is the arrangement the screen owns. The shape is not: a toggle
is a pill 32 tall holding one line, and a day is a 96×110 grid cell holding a
date and two event rows. `Card` is no closer — the grid already draws the line
that separates one day from the next, and a card would draw a box inside it. So
the cell keeps the raw element and the contract the components exist to enforce:
it writes its own `aria-pressed` and its own name. The lint rule has a
file-scoped exception for that one file, and only for `button`.

These are `<button>` because `<button>` is what takes a click, not because they
are buttons. Keeping them out is what keeps the three above small — a component
that has to serve a card, a select and a scrubber has no shape left of its own.

**There is no back control anywhere in the product.** Three screens carried one
— the viewer, the lecture, the new chapter — and all three pointed at somewhere
the sidebar already points. `홈` and `내 강의` stand in it permanently, and the
lecture a person is inside stays lit while they are in a chapter of it. This is
the same call §4 makes for the modal's ×: where a way out already exists, a
second one is an exit in the corner people find last. Removing it also lets a
screen's title start the line instead of being pushed along by it.

The fourth of the four was not a back control at all — `새 주차 업로드` was
routing with `router.push` from a `<button>`. A destination makes it a link.

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

#### A control's height and the type inside it are one step

**Pick a step, not a height.** Every control — button, field, list row, toggle —
stands on one of §2's control heights, and each height carries one type step
with it. The two cannot be chosen apart.

| Step  | Height | Type         | Room above and below | Ratio |
| ----- | -----: | ------------ | -------------------: | ----: |
| `sm`  |     32 | `label` 14   |                    5 |  2.29 |
| `md`  |     40 | `label` 14   |                    9 |  2.86 |
| `lg`  |     44 | `body-sm` 16 |                   10 |  2.75 |
| `xl`  |     48 | `body` 18    |                   10 |  2.67 |
| `2xl` |     56 | `body-md` 20 |                   13 |  2.80 |

**`md` is where a control stands unless the screen says otherwise.**

The pairing is what makes the ramp usable. Lower the height alone and the type
sits in a box that has closed around it; lower the type alone and the box is
loose. Neither is a choice anyone makes on purpose — they are what happens when
a system lets the two move separately.

**Each step down changes something a person can see.** That is why `md` takes 14
rather than 16: at 16 it and `lg` differ by four pixels of padding and nothing
else, and a ramp with a step nobody can tell apart has a step that has to be
argued about forever. `sm` is the one place the ratio falls off, because §3's
ramp stops at 14 and there is nothing below it to pair with 32.

**The steps are not named for roles.** `confirm` and `row` were tried and
removed. Which role a screen is in needs a judgement every time, and the thing
that judgement was supposed to settle — rank — is not carried by height at all:
§4 gives it to fill against border, and to position. The judgement stayed and
bought nothing.

**A control's height is still not its own.** It is read against the control
beside it, which is why §2 puts buttons, fields and tabs on one list rather than
giving each its own. A screen picks one step for a row and everything in that
row takes it.

**60 does not survive**, and it is the reason the list has five steps rather than
six. The design file offers two clusters, 60 and 44, with 40, 46 and 52 drifting
between them. Where a field and a button meet on one row — a field with an invite
button at its right — four pixels leave the button standing proud at the top and
the bottom, and closing that gap the other way means adding 60 to §2's control
heights. A step added to a list is not one more line; it is one more judgement
every time a height is picked. §3 turned down a 12px step on exactly that ground.

**Of the places where the design file is not followed, this is the least
comfortable.** The dark panels of §2 and the 18px line height of §3 overruled
values with nothing behind them. 60 appears at six different widths here, which
reads as intent rather than drift. It is overruled anyway because the cost of
keeping it lands on the system — a sixth step everyone has to choose against
forever — while the cost of dropping it lands on one row, four pixels deep.

`IconButton` takes none of these. It is square, so height and width move
together and neither is read against a field; it is settled below by the glyph it
holds. `Toggle` takes a step like everything else, because it stands in a row
beside controls that have one.

#### A button is as wide as its label

**No button carries a fixed width, and none carries a minimum.** The padding is
18 on each side; the label decides the rest.

Width is the one channel a button has left, and it stays empty deliberately.
Rank is already carried by fill against border, and by position — a destructive
action stands at the far end of the footer, away from the pair. A minimum width
on the confirming button would say that a second time, and once width means
_this is the confirming one_ it can no longer mean anything else.

It holds because the labels are already even. **Every confirming and destructive
label in the product is four characters** — 생성하기, 수정완료, 삭제하기,
탈퇴하기, 초대하기, 시작하기 — so the confirming button and the delete button
come out at the same width, and only 취소, at two, is narrower. Nothing needs
propping up.

The design file's 346 and 192 were the alternative. They are a 960 panel's
numbers, and at 655 with a cancel button beside them the row no longer holds
them (192 + 12 + 120 + 12 + 346 = 682 against 559 of content).

**So the thing to keep straight is the label, not the width.** That is §6's,
and §6 has not settled it yet.

#### There are two modals, and neither has a close button

**A modal is either asking for input or asking a question.**

| Component      | What it is                         | Heading             | Footer                       |
| -------------- | ---------------------------------- | ------------------- | ---------------------------- |
| `FormModal`    | Fields to fill and a thing to save | A title above them  | Cancel and the saving action |
| `ConfirmModal` | One question about one action      | The question itself | Cancel and the action        |

`Modal` stays underneath both — focus trap, Escape, scroll lock, dim — and
screens do not call it. Two is the whole list a screen can reach for.

**There is no ×.** The footer always carries cancel, so a close button would be
a second way out sitting in a corner, and the corner is the one a person finds
last. Escape and the dim still close a modal; they are not what the screen is
counting on.

**Cancel is what makes that safe, so cancel is not optional.** Today not one of
the four form modals has it — the footers hold a saving action and, when editing,
a delete — and removing the × from those as they stand would leave a person who
has filled half a form with nothing on screen to press. Cancel is a second-rank
action and takes the border treatment §4 already defines.

Delete stands at the other end of the footer, away from the pair. Two filled
buttons in one row would otherwise be lime and red side by side, each claiming
the row; the gap is what ranks them.

#### A modal says out loud what it says to a reader

**No modal has a title that is only announced.** `FormModal` draws its title.
`ConfirmModal` has no separate title at all — the question is the heading, marked
up as one and read as a sentence.

The design file draws some form modals with no visible title, which the code met
by keeping the title and hiding it in `sr-only`. That is a string with one
audience, and a string with one audience is a string nobody notices going stale.
Where a modal needs a name, it shows it.

#### What two modals remove

`FormModal` exported seventeen names, eleven of them class strings that
screens pasted onto their own elements. None of them survived as exports:

| Where it goes      | What                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| `Button`           | `PRIMARY_ACTION`, `DANGER_ACTION`                                                 |
| `Input`            | `FIELD_BASE`, `FIELD_FILLED`, `FIELD_OUTLINED`, `FIELD_WIDTH`, `LABEL`, `HINT`    |
| The select         | `OPTION_LIST`, `OPTION_ROW`, `optionStateClass`, `ChevronDownIcon`, `ModalSelect` |
| Inside `FormModal` | `SECTION_DIVIDER`, `SECTION_GAP`                                                  |
| Gone               | `CloseIcon`                                                                       |

There is also a second copy of the shell, and it goes for a different reason.
`NewChapterUploadModal` redraws the same panel by hand, down to an identical
`className` string, and it is the modal for editing a chapter — **which stops
existing.** A chapter is made on a screen rather than in a modal (that was
settled in #107: the flow is used during a lecture, and a modal traps it), and
once made, the only thing about it that changes is its title, which the viewer
edits in place. Nothing is left for that modal to do.

The cost is that a file, a date or the wrong lecture cannot be corrected — the
chapter is deleted and made again, and for a 200MB recording that is the whole
upload a second time. It is accepted because all three are the same mistake,
made and noticed in the same minute, on the screen that just did it. **Deleting
a chapter becomes the only way back, so deleting one has to ask first** — which
is what `ConfirmModal` is for, and it opens from the list, where no modal is in
the way.

Three form modals are left: the exam, the todo and the lecture.

#### Both modals are 655 wide, and neither scales

**655px, fixed, at every window width.** The confirming modal takes it from the
design file; the form modal takes it from the confirming one, because a panel
that turns from a form into a question should not change size while doing it.

Fixed rather than proportional is a change to §5, which had the modal follow the
viewport. A modal that scales takes everything inside it along — a field at full
width, a two-column row, the space a label has to wrap in — while §5 holds type
and control heights at one size. Fixing the width is what makes the inside one
set of numbers instead of a range.

The design file's 960 was the alternative and it is a 1920 figure. Under the
proportional rule a 1440 laptop already draws that modal at 720, so the number
in the file was never the number on the screen; 655 is 65 less than what is
there now, and it is the same on every machine.

**Height is the content's, capped at 80% of the window.** On an 803-tall laptop
that is 642. None of the three form modals reaches it once the controls stand on
`md` — the todo's, the tallest, comes to 628. At `2xl` it was 732 and scrolled;
the pairing above is what took it under the cap.

**The title and the footer hold still; only the fields scroll.** If a modal does
reach the cap and all three scroll together, the person loses both the name of
what they are filling and the way to finish it — the two things a form modal
exists to hold. So the panel is three bands: a title that stays, a field area
that scrolls, a footer that stays.

Spacing inside a modal comes from §2's list like everywhere else. Six values in
the current shell are not on it — 84, 60, 89, 47, 15 and 18 — and they become 48
for the padding, 16 for a grid gap, 24 between blocks and 32 above the footer.
The lint rule does not catch these: it guards color and type, and leaves width,
height and spacing to be read.

#### A question is asked at the page's own size

**`ConfirmModal` asks in `heading-sm`, and the sentence under it is `body-sm`.**

The design file asks in `heading-md`, which is larger than the heading of the
page it interrupts. The dim and the shadow already say the modal is on top; a
heading that outranks the page's own says it a second time, and that is the
doubling §2 refused when it kept stacking order out of the shadow. At 24 the
question stands level with the page it came from and reads as a question inside
it rather than an event over it.

Below that it stops working. The size the code uses today, `body`, is two steps
from the card titles sitting behind the dim, and inside a 655 panel it leaves
the panel looking empty. **The question has to be the largest thing in its own
panel; it does not have to be the largest thing on the screen.**

#### A field has no border until it has something to say

**The fill is the field. A border appears only for focus and for failure.**

| Part        | Value                        | On `well` |
| ----------- | ---------------------------- | --------: |
| Fill        | `well`                       |         — |
| Value       | `gray-700`                   |    9.95:1 |
| Placeholder | `gray-500`                   |    4.52:1 |
| Label       | `gray-700`, above the fill   |    9.95:1 |
| Focused     | `sky-ink` border             |    4.07:1 |
| Invalid     | `red-ink` border and message |    4.74:1 |
| Disabled    | `gray-400` value             |    3.04:1 |

§2 hands most of this over already: `well` is named for recessed areas, borders
are not the default separator, and the border of an invalid field is `red-ink`.
Only focus was open.

**Lime cannot do it.** `#e3ff00` on `well` is 1.00:1 — not faint, absent. The
signature color is not available for the one state the system is obliged to
show.

**Ink cannot do it either, and the reason is the interesting one.** A
`gray-800` border reads at 13.73:1, nearly three times the invalid border's
4.74:1. Focus happens on every field a person touches; failure happens rarely
and matters when it does. A focus ring louder than an error is the same
inversion §2 refused between red and amber — the constant signal drowning the
rare one.

So the border carries state and nothing else: absent is resting, blue is here,
red is wrong. `sky-ink` at 4.07:1 sits just under the error at 4.74:1 and on the
opposite side of the wheel, and `*-ink` steps already carry borders — this is
the second use of that rule, not a new one.

**Focus is not optional.** It is the one thing in this document that is a
requirement rather than a choice (WCAG 2.4.7). What is optional is showing it to
a mouse: `:focus-visible` leaves that to the browser, which gives the ring to
keyboard navigation — and to text fields always, since a caret has to be
findable.

#### A required field is marked, an optional one is not

**A field that cannot be left empty carries a `red-ink` `*` after its label.**
Nothing is added to the others.

The product marked the opposite before, and marked it twice. Modals suffixed
the optional fields — `강의 (선택)`, `교수명 (선택)`, `메모 작성 (선택)` — while
onboarding baked a `*` into the label string, in the label's own gray. **Two
conventions pointing opposite ways, and the same form could not be read by
either rule alone.**

**The count argues the other way, and loses anyway.** Of the thirteen labelled
fields in the three form modals and the two nickname screens, **eight are
required and five are not** — so this rule paints eight marks where the old one
painted five. It wins on where the mark lands, not on how many there are: a
person who misses `(선택)` has learned nothing, while a person who misses `*` is
about to meet a disabled submit button with no reason given. The mark belongs on
the field that can stop them.

It also survives the form growing. Optional fields are the ones a form adds —
memo, professor, a second date — so marking them is the count that keeps
rising.

**The color is borrowed, not owned.** §2 gives `red-ink` to «wrong», and a
field that has not been filled in yet is not wrong. It is taken anyway: the red
asterisk is the one form convention that needs no legend, and inventing a
quieter mark would spend a screen's worth of learning to avoid borrowing a
color for one glyph. The mark is a glyph, never a border or a fill, so it
cannot be mistaken for the invalid state above.

**The asterisk is `aria-hidden`, and required is told separately.** Read aloud
it turns the field's name into `제목 별표`. What carries the meaning is the
control's own attribute, and the controls differ:

| Control      | How required is told    |
| ------------ | ----------------------- |
| `Input`      | native `required`       |
| `Combobox`   | `aria-required`         |
| `DateField`  | **nothing — see below** |
| `FieldGroup` | the fields inside it    |

`DateField`'s trigger is a `button`, which is not a form control and which ARIA
does not let carry `aria-required`. So its asterisk is for sighted users only,
and the empty value is caught by the form's own submit gate instead. **This is
a known gap, not an oversight**, and it closes if the trigger ever becomes a
real input.

**The mark lives in one place.** Four components draw a field label, so the
asterisk belongs to none of them — `FieldLabel` draws it, and the four pass
`required` through.

#### An icon in a field stands in front of it

**The leading slot says what the field takes. The trailing slot says what
pressing it does.**

| Slot     | What it means          | Pressed | Today                        |
| -------- | ---------------------- | ------- | ---------------------------- |
| Leading  | What this field is for | No      | `search`, `calendar`, `time` |
| Trailing | A list drops from here | Yes     | `Select`, `Combobox`         |

One slot cannot hold both. Every field icon in the codebase sat on the right and
every one of them opened something, so "right side" could be read as "press
this" — until a magnifier arrived, which opens nothing. Putting it on the same
side spends that reading for a decoration.

**`aria-haspopup` had already drawn the line and the screens ignored it.**
`Select` and `Combobox` are `listbox`: a list drops beneath the field, and a
chevron points at where it will land. `DateField` and `TimeField` are `dialog`:
a calendar, or a pair of columns, opens as a new surface, and an arrow pointing
down describes nothing about that. All three were drawn with the same chevron
anyway. So the date field takes a calendar and the time field a clock, in front,
and neither keeps a chevron — what a `dialog` trigger owes the screen is what it
is, not which direction it opens.

**The leading icon is `gray-500`, not the `gray-400` §2 gives meaningful
icons.** On `well` that step is 3.04:1 while the placeholder is 4.52:1, which
leaves the icon fainter than the hint. The hint leaves when a value arrives and
the icon stays, and the permanent mark cannot be the quieter one.

**Its size comes from the control step, not from a prop.** §3 binds an icon to
the text beside it and `control` already binds that text to the height, so the
step settles it: every field is `md`, which is `label` 14, which rounds to 16.
No field offers a size today, so there is one number and nothing to disagree
with it.

**A label above and an icon in front are the same sentence twice**, so the type
takes one or the other and the build rejects both. The rule directly above about
unenforced rules applies to this one.

**The field element is a `<label>`.** Once the padding and the icon live outside
the `<input>`, the places a person clicks stop being the input: the icon
swallows nothing (`pointer-events: none`), but the box beneath it passes nothing
on either, and the 18px at each end goes dead the same way. Wrapping in a
`<label>` is the platform's own answer, costs one tag, and adds no accessible
name because it holds no text of its own.

#### Four things pick from a list, and they share one list

**The trigger differs; the list does not.**

| Component   | Trigger                            | Height           | Where                             |
| ----------- | ---------------------------------- | ---------------- | --------------------------------- |
| `Combobox`  | An input — typing narrows the list | 56, a field      | In a modal: the lecture, the week |
| `DateField` | A button opening a calendar        | 56, a field      | In a modal                        |
| `TimeField` | A button opening hours and minutes | 56, a field      | In a modal                        |
| `Select`    | A button showing the current value | 44, a row action | On a page: sort, view             |

The first three are fields — they carry a label, they hold a value, and the
value is submitted — so §4's field rules apply to them unchanged. `Select` is
not; it changes the screen the moment it is used, and it takes the height of
an action standing in a row.

Two of these replace two components each. `ModalCombobox` and `LectureCombobox`
are the same searchable picker written twice, and `TodoViewSelect` and
`SortSelect` are the same dropdown written twice. `ModalSelect` is exported and
called nowhere; it replaces nothing.

**The name loses `Modal`.** Once one of them serves a page the prefix is a claim
the component cannot keep — the failure §3 named when it removed `button-lg`.

#### The list is one specification

| Part             | Value                                    |
| ---------------- | ---------------------------------------- |
| Surface, shadow  | `surface`, `near`, radius `md`           |
| Width            | The trigger's                            |
| Direction        | Whichever side has more room             |
| Row height       | 40                                       |
| Rows shown       | 5, then it scrolls                       |
| Selected         | `lime-action`                            |
| Hovered or keyed | 8% black over whatever fill that row has |

**The list stays inside the panel it was opened in.** §2 leaves room for it to
float free — page, modal, dropdown is three levels and `near` is the third — but
it does not have to, and keeping it in means no position has to be computed
against the window.

**Direction is what makes that work.** In the todo modal the week picker is the
panel's last row: 120 below it and 312 above. Opening downward shows three rows
of fifteen; opening upward shows seven. One line of rule doubles it, and it
costs nothing that a list opening upward does not already cost.

**Five rows, not as many as fit.** A count rather than a measurement keeps the
list the same size wherever it opens — a modal at its height cap scrolls inside
itself, and a list sized to the room left would then show seven rows at one
scroll position and three at another. Five of forty is 208, which is what
`ModalCombobox` already uses; the other picker uses 160, and that split is what
a list with no rule looks like.

Selection and hover both take a fill, and they do not collide, because §2's
press rule composes: 8% black over `lime-action` is `#d1eb00`, the value §2
already computed for a pressed lime. So a selected row under the cursor is
neither of the other two states and needs no value of its own.

| Row state         | Fill      | Label against it |
| ----------------- | --------- | ---------------: |
| Resting           | `surface` |          16.48:1 |
| Hovered           | `#ebebeb` |          13.83:1 |
| Selected          | `#e3ff00` |          14.58:1 |
| Selected, hovered | `#d1eb00` |          12.24:1 |

**A combobox has two widths.** Full is the content column; half is that column
less the gap, divided in two — 559 and 271.5 in a 655 modal. Two halves fill
exactly the row one full one does, so a screen that asks for a lecture alone and
a screen that asks for a lecture and a week keep the same grid. The widths are
not fixed px: the current code pins the pair at 240 each with a 15 gap, which
stops adding up the moment anything around it changes.

#### A badge is a place a color lands

**A value gets a badge when it comes from a finite set. Everything else is
text.**

A badge is a fill, and a fill is a color, and a color has to mean one of
something. A value with no set behind it — a professor's name, a count of
chapters — has no color to be given, so a badge around it borrows the form
without the function: a box that draws the eye and then says nothing.

| Value                        | A set?                                 | Then      |
| ---------------------------- | -------------------------------------- | --------- |
| Days until the exam          | five bands, and §2 colors three        | **Badge** |
| The professor's name         | free text                              | Text      |
| "3 lectures"                 | a number                               | Text      |
| Not started · reading · done | three, but blue reads as text (4.94:1) | Text      |

Four badges in a row is the failure this replaces. When everything is a badge
nothing is emphasized, and the amber §2 reserved for time gets read as one more
gray pill.

**So there is no shared badge component.** With sharing out of the first
release, one value in the product passes the test: the exam countdown. It has a
component already, in `features/exam`, placed there because both of its callers
live in that feature — and that reasoning has not changed. `Tag`, whose seven
tones drew names, counts and deadlines alike, goes: its work becomes text, and
the one part that was not text is the countdown, which already exists elsewhere.

The countdown's colors move from red to amber, which §2 settled: red is what
went wrong, amber is what is running out.

**Its five bands are three colors and two grays, and the boundaries halve.**

| Days left | Fill        | Called       |
| --------- | ----------- | ------------ |
| D-15 +    | `gray-200`  | no color yet |
| D-14 – 8  | `amber-100` | two weeks    |
| D-7 – 4   | `amber-200` | one week     |
| D-3 – 0   | `amber-300` | three days   |
| past      | `gray-200`  | 종료         |

The count of bands is not a choice: §2 has three amber steps and forbids a
fourth, so only the boundaries were open. They halve — 14, 7, 3 — because the
ramp's own steps are even (ΔE 29.89 and 28.97) and time left is read as a ratio,
which is the argument §2 already makes about spacing. Each boundary is also a
unit a person says out loud: two weeks, a week, three days.

Equal fifths (14–10 / 9–5 / 4–0) was the alternative and it makes the last band
weigh the same as the first, which four days before an exam does not.

A finished exam takes the neutral gray rather than the darkest step. The label
inside it reads 종료, and the most urgent fill would be saying the opposite of
its own text.

#### A card takes the press rule unchanged

**Hover and pressed are the fill with 8% and 16% black over it — §2's rule, on a
white card, with nothing added.**

| State    | Fill        | From its base |
| -------- | ----------- | ------------: |
| Resting  | `surface`   |             — |
| Hover    | 8% black    |       ΔE 6.95 |
| Pressed  | 16% black   |      ΔE 14.55 |
| Selected | `lime-pale` |      ΔE 58.53 |

White is the ceiling, so hover can only go down, and down is what `well` means
in this system — which was the argument for giving cards a rule of their own.
Drawn out, the darkening reads as _this one_ rather than _this is sunken_: a
change that lives under the cursor is read as pointing. The alternatives each
cost a rule — a border only cards use, a shadow §2 forbids on lists, or no
feedback at all on a target the size of a card.

**A resting card on `canvas` takes a border, and only there.** The fill rule
above covers what a card does under a cursor; it does not give the card an edge
when nothing is happening to it. `surface` against `canvas` is ΔE 2.35, which is
the threshold at which a difference begins to register — the card is separated
from the page by exactly the amount that counts as barely, with nothing in hand
for a dimmer screen or a row of antialiased corners.

The border is `gray-100`, the step §2 names for rules and edges, and it is not a
second rule to remember: a card is either on the page or inside a panel, and
`sunken` already says which. A sunken card is `well` on `surface` at ΔE 7.65 and
carries its own edge, so it takes none. Nothing new is added to choose between
them.

**Pressed is drawn only where the screen stays.** A button does its work in
place, so the 16% fill is visible for as long as the finger is down. A card
usually navigates, and the pressed fill would be drawn and then thrown away with
the page. A card that navigates takes hover and stops there. A card that cannot
be pressed takes neither.

**Staying pressed is not pressed — it is selected.** A calendar cell that holds
its state until another is chosen is not a card mid-press; it is a `Toggle`, and
§2 gives it lime, at the pale step kept for lime over a large area. At ΔE 58.53
from white it cannot be read as a hover at 6.95.

**And the rule composes, which is the point of computing it.** 8% black over
`lime-pale` is `#deeb7e` — ΔE 7.66 from the selected fill, near-black text still
at 12.79:1. Hovering a cell that is already selected works without anyone
choosing a value for it.

#### A toggle is a pill, and it borrows its height

**`Toggle` is what a person switches on and off by itself.**

| State | Fill          | Border     | Label      |
| ----- | ------------- | ---------- | ---------- |
| On    | `lime-action` | —          | `gray-800` |
| Off   | `surface`     | `gray-100` | `gray-700` |

Off is the same as a second-rank button, and that is right rather than
unfortunate: both are things that can be pressed and have no color of their own,
so they speak the same way. Hover is §2's 8% black over whichever fill is
present, as everywhere else.

**The shape is what separates it from a button.** A lit toggle and a confirming
button are the same `#e3ff00`, and they have to be, because §2 gives one color
to everything that can be pressed. What tells them apart is the corner: a pill
holds a state, a 6px corner does a job. That is the meaning §2's radius table
now carries for `full`.

**A toggle has no height of its own.** It takes the height of the row it stands
in, which is the height of the controls beside it. Giving it a step of its own
would set a toggle and the button next to it at different heights for a reason
nobody could state — and a row's height is a property of the screen, settled
when the screen is drawn.

**What is a toggle and what is not.** The state has to belong to the control. A
tab strip with several tabs open at once is a set of toggles; a page number, a
chosen date, a current step is a _selection_, where picking one releases another
and the state belongs to the group. Selections are drawn by the component that
owns the group — a calendar — because only the group knows which one is
current. The ARIA divides on the same line: `aria-pressed` against
`aria-selected` or `aria-current`.

#### An icon button is twice its glyph

**The padding is half the glyph on every side, so the button is the glyph
doubled.** This covers `IconButton` and a toggle drawn without a label — both
are square, so one number settles them.

| Glyph | Padding | Button |
| ----: | ------: | -----: |
|    16 |       8 |     32 |
|    20 |      10 |     40 |
|    24 |      12 |     48 |

The ladder is not chosen, it is produced: §3's icon ramp is 16, 20 and 24, so
these are the only three buttons the rule can make, and all three are already on
§2's control heights. Nothing is added anywhere.

A fixed padding was the alternative and it fails at both ends. Hold the padding
at 8 and a 24 glyph nearly touches the edge, and the middle step lands on 36,
which is on no list — a ladder that needs a new control height to exist. Hold it
at 12 and the smallest button is 40, which stands taller than the text it sits
beside in a row. Half the glyph keeps the proportion constant, so a large icon
button and a small one read as the same object at two sizes.

**Where there is no text, position chooses the glyph.** §3 sizes an icon against
the text beside it, and a button with no label has none, so the rule has no
input. The substitute is the button's place:

| Where it stands                                     | Glyph | Button |
| --------------------------------------------------- | ----: | -----: |
| Inside a row — a toolbar, a field, a list header    |    16 |     32 |
| Alone — back to top, close, an overlay on an avatar |    24 |     48 |

Fewer of these are truly text-less than it first appears. An edit pencil stands
beside a screen's title, so §3's rule still runs and needs no substitute. What is
genuinely without a reference is the floating kind, and a floating control has
nothing around it to be measured against — it is measured against the hand.

**This is the one rule in §4 decided without a screen to check it on.** Every
other measure here was settled against something drawn. This one is a reasoned
guess at a gap in §3, and it is expected back when screens are built.

**It came back, and the answer is the middle step.** The first text-less button
drawn against a screen is the edit pencil beside a 32/44 title, and the two
sections disagreed about it: §3 gives an icon beside a heading the heading's own
size, which is 32, while the table above puts a button inside a row at 16. Both
were wrong on the screen — 16 is lost beside a 32 title and 48 stands taller than
the line the title sits on. The pencil is **20, in a 40 button**, which fits
inside the 44 line box. `IconButton` offers no 32 glyph at all, so §3's reading
was never buildable: §4's ladder comes from §3's own 16·20·24 ramp.

### States

#### Processing is one pulsing bolt

**A chapter that is still being made says so in its own row, and the row stays
usable.** Transcription and summarization take minutes, so a screen that blocks
for them takes the product away for minutes. The list keeps working; only the
row that is waiting changes.

| Part   | Value                                         |
| ------ | --------------------------------------------- |
| Label  | `처리 중`, where the status word already sits |
| Glyph  | The bolt, 16 tall, beside the label           |
| Color  | `sky-status`                                  |
| Motion | Opacity, pulsing                              |

The glyph is 16 because §3 sizes an icon against the text beside it and the
status word is `label` (14). Nothing here needs a size that does not exist.

A ring was the alternative — the bolt standing still inside a track that turns.
It reads well, and it costs a rule: the bolt only fits inside a ring at a
diameter of 24, which is not what §3 gives a glyph beside 14. A pulsing bolt
needs no exception.

#### The card does not count stages

**The card cannot show a percentage, and the stages it could count are not worth
counting.**

Upload already has a screen of its own — a full-screen overlay where ten bolts
fill from the left — and it is the only part of the job with a real number
behind it, because the browser reports bytes sent. What follows it does not:
`ProcessStatus` answers `READY` or `PROCESSING` and nothing else, so a
percentage on the card would be a number the product invented. An invented
percentage is found out. One that sits still for three minutes reads as a fault,
because a percentage is a value that is supposed to move.

That leaves counting stages, and the card is the wrong place for it. The card
does not exist until the upload has finished, so the stages left are two —
transcription and summarization. A fraction of two spends its whole life at one
of two values, and the second of them, `2 / 2`, says finished while the work is
still running.

**So the bolt says one thing: this is still alive.** Where it is, the word beside
it says.

#### The bolt has two jobs and they are told apart by count

| Where          | How many | What it means |
| -------------- | -------- | ------------- |
| Upload overlay | Ten      | How far along |
| Chapter row    | One      | Still working |

Ten bolts filling is a measurement. One bolt breathing is a pulse. They are the
same glyph because they are the same product, and nothing else has to change to
keep them apart.

The bolt is not the logo. The logo's symbol is the pill; the bolt is a separate
mark that until now appeared on the upload screen alone. Giving it a second job
does not put the brand mark on every wait.

#### Known cost: the bolt is under 3:1

`sky-status` on a white card is 1.67:1, and the pulse takes it lower still. The
signature cyan cannot clear 3:1 without dropping L\* by about twenty, and at that
point it is a second cyan standing beside the first rather than the same one.

It is permitted, because the status word sits right next to it and carries the
state on its own — the glyph is not required in order to understand the row. It
is accepted rather than defended: the contrast formula measures luminance and
ignores hue, and a saturated cyan is easier to find than 1.67:1 predicts, but
only on a bright screen and only for a reader whose color vision is unimpaired.

**The bolt is never the only thing saying `처리 중`.** That is the condition this
rests on, and it has to hold everywhere the rule is applied.

The depth and period of the pulse are not set here. They belong to Motion (§2),
which is not settled, and the choice matters: at an opacity floor of 0.22 the
glyph reaches 1.13:1, which is not a pulse but a disappearance.

#### A chapter row has one slot, and no button

**The row itself is the target. Where a button used to sit, one word says where
the chapter is.**

| Slot             | When                    |
| ---------------- | ----------------------- |
| `처리 중` + bolt | The AI is still working |
| `실패`           | It stopped              |
| `학습 전`        | Read zero times         |
| `1회독`, `2회독` | Read that many times    |

A button inside the row was the alternative, and it was three buttons: `학습하기`
on sky, `이어서 학습` on yellow, `복습하기` on gray. Every one of them collides
with something settled — §2 gives lime to anything pressable, amber to what is
running out of time, and §4 makes a gray fill mean disabled. Taking the button
out removes all three collisions at once, and §4 has already given the card a
press rule (8% black on hover), so the row loses nothing by becoming the target.

**Study is counted, not staged.** A chapter is read once, then again before the
exam, then again the night before; `학습 전 / 학습 중 / 완료` cannot hold that and
the third state is wrong the moment someone opens a finished chapter again. A
count has no such ceiling.

This also closes one of §2's known costs. _Completed and pressable share a
color_ was a problem because completion was a state a fill had to carry; when
completion is a number, nothing has to carry it but the number.

**Zero is a word and the rest are numbers.** `학습 전`, then `1회독`. The product
already writes zero this way — the exam badge counts `D-3`, `D-2`, `D-1` and then
`D-DAY` — so this is the same rule twice, not two rules. `0회독` was the
alternative and it is not how the language counts; writing a thing nobody has
done yet as a zero also reads as a nudge, which the exam badge avoids for the
same reason.

The two labels are the same width — 학습 전 and 1회독 are both three characters —
which the D-day badge had to solve with a fixed width because `D-DAY` and `D-1`
are not.

**What the backend has to change.** This one is a replacement, not a field:
`ChapterStatus` stops being `BEFORE | IN_PROGRESS | DONE` and becomes a count,
with an endpoint the chapter screen calls to add one.

#### A 회독 is raised by a stepper, and lowered by the same one

**The chapter screen carries `−  3회독  +`. The chapter list carries the number
and nothing else.**

This is the only control in the product that is pressed repeatedly on the same
screen. Every confirming button is pressed once and the screen it stood on goes
away. That is why this one does not take a confirming button's size, and why
§6's `~하기` rule does not reach it — a stepper has no word in it at all.

**Undo is the whole question.** A count that only goes up is a record that can
never be corrected, and one wrong press stays wrong for the rest of the term.
The stepper makes the way back symmetric: right is +1, left is −1. There is
nothing to learn and nothing to discover.

The two alternatives both hide it. A long press is a gesture with no place to
announce itself — the product uses it for editing a TODO and a chapter's
details, and someone who does not know it is told nowhere. A `되돌리기` inside a
notice works only until the notice fades, and it would add a component §4 has
spent this section removing.

The icon buttons are **32**, which is §4's own glyph × 2 at a 16px glyph. No new
value enters.

**The list gets no control.** §4 gives a chapter row one slot and no button, and
the row itself is the target; a stepper there would put two targets in one row
and one of them would be 32px inside a 40px press area.

**Cost accepted: a record becomes an adjuster.** Nothing stops the number going
up without anything having been read. This count is a private study log rather
than a claim anyone audits, so the cost is bounded — but it is the reason the
plus is a 32px icon and not a lime button at 56. **The control is as loud as the
thing it records is important, and no louder.**

**What the backend has to change.** §4's `reviewCount` has to go down as well as
up. An increment-only endpoint cannot serve this, so it is one endpoint that
sets the count, or two that step it.

#### A failure is one word in the list and the whole account inside

**The row says `실패` in `red-ink`. It does not dim, and it still opens.**

What failed is the AI, not the chapter. A chapter whose transcription failed
still has its slides; one whose summary failed still has its transcript. Dimming
the row would close the way to those, and nothing is wrong with them.

So the list carries the fact and the chapter carries the account. That division
is also what keeps a row readable: a row has one line for its state, and `실패`
fits there where `요약 없음 · 다른 녹음이 필요해요` does not. Naming the missing
piece in the list was the alternative — it is more informative and it is the
wrong place, because the list is read by scanning and the account is only useful
where it can be acted on.

`red-ink` because red is what went wrong and amber is what is running out of
time (§2). A failed conversion is a loss, not a deadline.

**What the backend still has to send.** `FAILED` alone is enough for the row.
The chapter needs more: the two status endpoints already say _which_ stage
failed, but telling someone to wait apart from telling them to change the file
needs `retryable`. Without it every failure gets the same button, and half of
them — a recording with no speech in it, a file that will not open — can never
succeed however often it is pressed.

#### An empty place says one sentence and nothing else

**Wherever nothing is there, a sentence says so. No illustration, no button, at
any size.**

The places differ enormously — a dropdown list is 272 by 208, a viewer tab is
about 440 wide, a home screen is the window — and one sentence fits all of them.
A rule that changed with the size would need a line somewhere in the middle, and
the viewer tab is exactly the width that line would have to be drawn through.

**The button is already beside it.** The lecture list, the todo list and the
exam list each put a create button in their own header, as a sibling of the
message rather than inside it. Repeating it in the empty area would give one
path two doors on one screen, and unlike §4's button widths this channel is not
empty — the door is already drawn. The current copy even points at it: _아직 만든
강의가 없어요. 생성하기로 첫 강의를 시작해보세요._

Illustration was the alternative, for the empty home a new account opens first.
It is the one screen where the argument holds, and it holds only there; it buys
a warmer first minute and costs a third rule and a judgment about which places
count as a page.

**Not every empty place is waiting for something.** Of the twenty-one messages
in the product, fourteen say _nothing made yet_, three say _nothing matched_ —
a search, a date — and three say _nothing left_, which is good news. A door
belongs to the first kind only, which is another reason not to put one in the
empty area: the area does not know which kind it is, and the header does.

> **Undecided.** What the chapter shows in place of a stage that failed. It
> waits on the chapter screen itself, which is not designed yet; §4 settles only
> what the list says. Disabled is settled per component rather than here — the
> button and the field each name their own.

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

> **Undecided.** The landing page gets a phone version later, if it gets one
> here. It is the one screen read before anyone signs in, §3 already sets it
> outside the type ramp for the same reason, and §7's Scope leaves open whether
> this document reaches it.

#### No screen forbids scrolling

**No page clips its own overflow.** If a screen turns out taller than the
window, it scrolls.

The reason is not preference: **viewport height is not a number this design can
hold.** The design file draws 37 screens exactly 1080 tall, and the measured
viewport on the laptop this is built on is 803 — browser chrome takes the
difference, and it moves with the browser, the toolbars and the zoom. There is
no width at which the height is known, so a layout built to fit one is built for
whoever measured it.

The home screen shows what fitting costs. Its calendar is one panel that has to
be read whole; make the page fit and the cell height falls out of the viewport,
and the cells stop holding the entries they exist to show.

**A region may still stand to the window's height.** The study view is the case:
two panels side by side, each sized against the viewport and scrolling on its
own, which is what lets the material and its summary stay level with each other.
That is the region deciding its own height, not the page refusing to grow — and
so the study screen usually shows no scrollbar, while anything that does
overflow still scrolls rather than disappearing.

That difference is the whole reason to write the rule this way. A page that
clips loses what overflows in silence: this codebase has already spent a day on
43 pixels of it, where a hidden `sr-only` input escaped the clipping chain and
every container measured clean. A page that scrolls shows the same bug on the
first look.

**A region with its own scrollbar is a separate matter.** The rail's course
list, the TODO list, the page thumbnails — each decides how much of itself to
show, and that works whether or not the page behind it scrolls.

**What a region must not do is pick a row count.** The rail's list was capped at
seven courses and scrolled inside that, so a taller window showed seven and a
shorter one also showed seven. A region's height comes from the room it is given,
and the window decides that. The count was a number nobody could defend at any
particular viewport.
The chapter list was the third. It paged four at a time, which is the same
undefendable number wearing pagination instead of a cap — four rows on a tall
window and four on a short one. Every chapter now shows and the page scrolls, and
the pagination component went with it.

The lecture list was the same rule broken a second way. It capped itself at
three rows — 90 per card, twice a 12 gap, 294 — and scrolled inside that, on a
page whose only content it was. Unlike the rail's list it has nothing above or
below holding it in place, so it needs no height of its own at all: the cap
came out and the page scrolls, which is what the rule at the top of this section
already said.

**And the region is the list, not the rail.** `홈`, the `내 강의` row and the
profile stay where they are; only the courses under them move. Scrolling the
whole rail would take the two rows a person navigates by off the top, and it is
the course list that is long, not the menu. So the list takes whatever is left
between them — 596 tall in a 900 window, 376 in a 680 — and scrolls only when its
contents exceed that.

#### A scrollbar that reserves width is a layout decision

**A scroll region inside a narrow column hides its scrollbar and draws its own
indicator.** The bar appears while scrolling and fades after it stops.

The reason is arithmetic rather than taste. Blink gives a classic scrollbar 6px
of layout whenever it is shown, so a region that keeps one — even a reserved,
invisible one — is 6px narrower than its container for everything inside it. In
the collapsed rail that was the whole story behind a selection that looked
crooked: the lime fill is inset 8 from its row, the row was 84 wide inside a 90
rail, and the fill measured 8 on the left and 14 on the right.

Letting the bar appear and disappear natively is worse, not better — it takes the
6px back each time it shows, so the rail's contents shift while a person is
reading them. So the native bar leaves the layout entirely and the indicator is
an overlay, which costs a few lines and owes nothing to the width.

#### The frame

A rail on the left, 72 wide, holding icons; the canvas beside it; a chat tab
pinned to the right edge. The rail opens to 216, and it **pushes rather than
covers** — the content moves right by the same 144 and keeps the width it had.

**The rail holds three things: `홈`, `내 강의` and the profile.** `내 강의` is
both a link to the lecture list and the header of the course list under it, and
those are two targets rather than one — the row navigates, the chevron beside it
opens and closes. It used to be a toggle with a separate `강의 관리` row at the
bottom pointing at the same screen; one row now does the job of both. Below the
open rail the chevron has no room, so a collapsed rail navigates and does not
toggle — the dots are all visible there anyway, so there is nothing to open.

**Sharing is gone from the frame too.** A second group, `공유 강의`, sat under
the first; §7 puts sharing out of scope and it was the last place the feature
still showed.

**72 is three icons, and 216 is three of those.** The icons in the collapsed rail
are 24, so 72 puts one icon's width on either side of one icon — `24 + 24 + 24`.
It was 90, which left 33 a side and made the rail read as mostly margin.

The open rail is 216, and two readings land on it. It is the collapsed rail three
times over. And what is left after the icon column and the label's own 20 is 124,
which is 10.3 characters — Korean sets at exactly 12px a character in this row, so
`4자` measures 48 and `알고리즘설계와분석` measures 107. The longest course name in
the data fits with 17 to spare.

**A third thing improves and it was not the reason.** §5's gutter floor takes the
open rail out of the room the content column has, so a narrower rail delays the
point where the floor starts cutting into the column: opening and closing the rail
stops changing the body width at 1272 rather than 1502. The number the content column
subtracts is still 90, and that is a different number: 0.8257 is `1511 / 1830`
and 1830 is the design's `1920 - 90`, so the ratio and that 90 came out of the
file together. Narrowing the rail is not a reason for the body to get wider.

**The rail's icons sit one step above the 3:1 floor.** §2 puts a meaningful icon
at `gray-400`, and against the old dark rail that measured 5.37:1 while the label
measured 10.77:1 — icon and label about two to one. Inverting the ground left the
label at 10.72 and dropped the icon to 3.27, which is over three to one and reads
as a different kind of element rather than a quieter one. `gray-500` puts it at
4.87:1 and the ratio back to 2.20. The floor is a floor, not a target, and in the
collapsed rail the icon is the only thing naming the row.

**The rail is light.** It was drawn dark and stayed dark after §2 removed dark
surfaces, which left it the one dark plane in the product and left §4's "there is
no dark surface" true everywhere except the first thing on screen. It now takes
`frame`, §2's cream one step down from the canvas. Its labels are `gray-700`, its
icons `gray-400`, and its active item is a lime fill with `gray-800` on it —
lime as text was never available here, since on any light ground it measures
between 1.07:1 and 1.13:1.

That is one formula rather than two states. The column is
`(100% + rail - 90) * 0.8257` measured inside the pushed content box, and
`100% + rail` does not move when the rail does, so the width reduces to
**(viewport - 90) x 0.8257** — the same number open or closed. Measured, open
against closed: 1165.9/1165.9 at 1502, 1246.8/1246.8 at 1600, 1511/1511 at both
1920 and 2560.

**This holds down to 1502 and not below**, because under that width the gutter
floor in the next section takes precedence and the open rail does narrow the
column: by 10.7 at 1440 and by 46.9 at 1232. Keeping the width is what the
formula is for; clearing the chat tab is what the floor is for, and where the two
cannot both be had, the floor wins.

#### The wide end is 2560

Nothing new is needed for it. Containers already cap at their design px, so at
1920 the content column reaches 1511 and stops; past that the margins take what
is left (396.5 a side at 2560). 2560 is a width to check, not a rule to write.

The cap is not a chosen number. 1511 is what the formula returns at 1920, which
is the design width, and the reason to stop there is that the panels inside the
column were drawn at that size. This is not the reading-width argument that caps
a column of prose — the column holds panels set beside each other, so what
overgrowing costs is fidelity, not legibility.

#### The gutters have a floor, and only the right side sets it

**The column keeps at least 40 on each side.** Where that cannot be had, the
column narrows to give it.

**The chat tab is the whole reason.** It is fixed to the window's right edge, 32
wide, and it belongs to the window rather than to the column — so a gutter under
32 puts it on top of the content. At 1280 it did: the column ended at 1259 and
the tab began at 1248, an 11px overlap across the tab's 107-tall band. 32 plus 8
is 40, and the 8 is the width the rail's own drag strip already uses.

**The left never binds, and it is worth saying why not.** Two things reach past
the rail's edge — an 8-wide drag strip hanging 4 out, and a 24 chevron hanging 12
— and both exist only while the rail is _closed_. Closed leaves at least 99.5 on
that side at every width down to 1232. Open, nothing protrudes at all. The floor
reads as a rule about both sides only because the column is centred; one number
governs two gutters whether or not both need it.

**The cost lands on the laptop widths:**

| Viewport | Floor 20 | Floor 40 | Column loses |
| -------: | -------: | -------: | -----------: |
|     1232 |    942.9 |      896 |         46.9 |
|     1280 |    982.6 |      944 |         38.6 |
|     1366 |   1053.6 |     1030 |         23.6 |
|     1440 |   1114.7 |     1104 |         10.7 |
|     1502 |   1165.9 |   1165.9 |            0 |
|     1920 |     1511 |     1511 |            0 |

At **1502 and above the floor costs nothing** and the column is one number at
every state. Below it the column pays, and only with the rail open — closed, the
rail leaves 99.5 or more on the left and the floor never comes near. That is the
trade being made: text that stays clear of a control it does not own beats 40
more pixels of panel.

**This closes most of the narrow end.** The earlier note here put the break at
1232, where `max-width: calc(100% - 40px)` clipped the column by 6.9 and the
margins hit zero. With the floor there is no such width — the column narrows
continuously instead of failing at a point, so there is nothing to declare broken.

> **Undecided.** What remains of the narrow end is the study split: the width at
> which the material and its summary stop being readable beside each other. That
> is measured off the panels' contents, not off the frame, and it is a different
> question from the one the gutters answered.

#### A screen that reads down one column takes the modal's width

**Two column widths, and which one a screen takes is settled by whether anything
stands beside anything.** The content column is for screens that lay work out
side by side — material against summary, calendar against TODO — and there a
wider column is more of what the screen is for. Settings and onboarding read down
a single column, and widening those only lengthens the lines.

**The reading column is 655, which is the width §4 already gave both modals.** A
modal is this product's existing one-column reading surface: one column, fields
and short lines, nothing beside anything. Settings and onboarding are the same
situation, so the number is not chosen again — the decision is reused. It lives
in `globals.css` as `read-col`, the way the content column does.

**What settles it is the window being halved.** People run this beside their
material: the lecture file on one side, the product on the other. Halving the
1920 the frame is drawn for leaves a 960 viewport, the open rail takes 216, and
744 remains. The reading column plus the gutter floor is 655 + 80 = **735**, so
it fits with 9 to spare, and it fits whether the rail is open or closed because
closed only gives it more.

| Viewport      | Rail | Available | Column | Right gutter |
| ------------- | ---: | --------: | -----: | -----------: |
| 1920          |  216 |      1704 |    655 |          528 |
| 1280          |  216 |      1064 |    655 |          208 |
| 960 (1920 ÷2) |  216 |       744 |    655 |           48 |
| 840           |  216 |       624 |    538 |           46 |

Below that it narrows continuously rather than failing at a width, which is the
same answer the gutter floor gave the content column. The plan cards are what
would break first, and they hold their line count down to a 600 column and lose
one at 560 — the floor reaches 560 only under a 640 viewport.

**747 is retired, and the reason is worth recording.** It was never derived. It
appeared in this section twice and nowhere else, and what it actually measured
was the settings _row_ in the design file — a row's width read backwards into a
screen's. §7 puts the design file outside the sources and says to read a citation
as provenance rather than as somewhere to go back to; a number carried in with no
argument is exactly what that rule is for. It also failed the case above: at a
960 viewport it left a 6px gutter, and the chat tab is 32.

**This does not settle the study split.** The width at which material and summary
stop being readable beside each other is measured off those panels' contents, and
the reading column does not depend on the answer.

#### Every page is inset by the same amount

**A page is 48 from the top and 48 from the bottom, on both columns.** The
column decides the width; this decides only the inset, and it is one number.

The product had four of them. Two screens carried design px straight into the
code — the home at `68 / 44` and the profile at `83 / 67` — and none of those
four are on §2's scale, which stops at 24 in fours and then goes 32, 40, 48.
Two more screens sat on the scale and still disagreed: `48 / 48` on three
screens against `40 / 32` on two.

**Top and bottom are equal because nothing could say why they differed.** An
asymmetric page inset is usually the trace of a last element carrying its own
margin, not a decision, and none of the five files recorded one. 48 wins the
count as well, three screens to two.

**The focus mode keeps `16 / 16`.** Giving the panels the window is what that
mode is for, so the inset is the thing it is allowed to spend. It is the one
exception and it is on the scale.

**Below `lg` the page carries its own side gutter, and above it the leftover
width does.** `px-4`, then `px-8` from `md`, then nothing — a side padding that
survives into the wide range eats the column's own width and keeps it off its
cap (§5's gutter floor is the column's business, not the page's).

### Responsive Behavior

**Text and controls hold one size across the whole desktop range. Containers
that belong to the viewport follow it.**

| What                                             | How                                                         |
| ------------------------------------------------ | ----------------------------------------------------------- |
| Type, control heights, component insides, modals | The design px, at every width                               |
| Content column, side panel                       | The ratio measured from the design, capped at the design px |

A laptop is not a narrow desktop. Between 1280 and 1920 the reader has not
changed and neither has the reading distance, so 18px that was right at one
width is right at the other. What changes is how much room the page has, and
room is what a container is for.

**A modal moved to the first row.** It looked like a container and it behaves
like a component: it holds fields at full width and rows in two columns, and
letting it follow the viewport resized all of them while §3's type and §2's
control heights stayed put. §4 fixes it at 655 and settles the widths inside
against that one number. It still needs a floor — a fixed width can outgrow a
narrow window — so it keeps a guard at the viewport less a margin.

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

---

## 6. Content & Locales

### Voice & Tone

This document is written in English; the product's interface copy is Korean.
The rules here govern Korean UI text.

#### The product speaks in 해요체, and the landing page is outside this rule

**Every sentence inside the product ends in `~요`.** `아직 만든 강의가 없어요`,
`강의 명을 입력해 주세요`, `저장에 실패했어요. 잠시 후 다시 시도해 주세요`. There is
one register and it covers every kind of sentence the product writes.

The alternative was 합니다체, and it fails on a point of grammar rather than of
taste. **합니다체 can state, but it cannot instruct.** Its imperative is
`~하십시오`, which no app of this kind uses; soften it to `~하세요` and the
sentence is already 해요체. The product instructs in **47 places** — every
field hint, every empty form, every error that asks for a retry. A register
that cannot do the thing this product does most often is not the register.
해요체 does both halves: `~없어요` states and `~해 주세요` instructs, with no
seam between them.

Who reads these sentences settles the rest. They are read by a student in the
middle of a lecture, or the night before an exam, on a tool they are holding.
합니다체 is an institution addressing a person. This is not that.

**The landing page is not covered by this rule.** Its copy addresses someone
who is not a user yet, and it does so in paragraphs rather than in lines —
and for paragraph prose Korean's default is 합니다체
(`크래밋이 당신의 학습을 연결합니다`). Rather than write a second register into
this section and then have to decide, sentence by sentence, which side each new
string falls on, **the landing is treated as a separate surface and left out.**
It keeps what it has.

| Where                         | Register                  |
| ----------------------------- | ------------------------- |
| Everything inside the product | 해요체, without exception |
| The landing page              | Outside this document     |

**What this costs.** Nineteen live strings are in 합니다체 and have to be
rewritten; four more die on their own (two developer placeholders, and two in
the modal §4 removes). Eight of them are the same empty-state pattern
(`~없습니다`), and **four of those eight sit in one folder** —
`features/study/components/viewer/`. That is not a register anyone chose; it is
a trace of who wrote the files. It is also the exact thing a voice rule exists
to prevent, which is the argument for having one at all.

#### A button names the action, not the state after it

**Every confirming and destructive button ends in `~하기`.** 생성하기, 수정하기,
삭제하기, 탈퇴하기, 초대하기, 시작하기.

`완료` is what becomes true _after_ the press, not what the press does. No one
writes `삭제완료` on the button that deletes, and `수정완료` is the same mistake
with the mistake hidden — it reads as a label for the state the screen is about
to leave. **A button is read in the instant before it is pressed, so it says
what pressing it does.**

The five labels measure **109px each**, at `18px / 600` with 24px of side
padding. That is not a coincidence to be grateful for; it is what this rule
produces. §4 gives a button its label's width with no minimum, and that rule
only holds while the labels are even — **this is the rule that keeps them
even.** A confirming action and a destructive one standing in the same footer
come out the same width.

The alternative considered and rejected was the bare noun — `생성`, `수정`,
`삭제`. It measures **78px**, and `취소` also measures 78px, so the confirming
action and the way out of the modal would carry identical width. §4 built that
hierarchy out of a border rather than a fill; matching their widths spends it
back.

**What this costs.** One word, in six places. It also **removes a split rather
than settling it**: `수정완료` and `수정 완료` were the same label written two
ways in two files, and the string ceases to exist.

**A button that stands alone is outside this rule.** The reason above is a
width reason — it exists so that a confirming action and the way out of the
modal do not come out the same size. `다시 시도` stands in an error block with
nothing beside it, in all six places it appears. There is no width to keep
apart, so `~하기` would buy nothing and cost two characters.

This is the boundary, not a list of exceptions: **the rule applies wherever two
buttons share a footer**, which is every modal, the profile form, and the
summary editor's toolbar.

#### A pressed button drops `하기` and takes `중…`

**While a button is working it says its own word plus `중…`.** `생성하기`
becomes `생성 중…`, `삭제하기` becomes `삭제 중…`, `수정하기` becomes
`수정 중…`.

There is nothing to decide per button, which is the point. §6's label rule made
every confirming label `<word>하기`, so the progress text is that label with
`하기` removed and `중…` put in its place. **No new word enters the product to
say that something is happening.**

Two mismatches today show what the absence of this rule produced. Pressing
`수정완료` displays `저장 중…` — two different words for one action, in one
button. And `생성하기` displays `생성 중…` in one file and `만드는 중…` in
another, for the same action.

**The progress text lives inside the button, so this is a width rule too.** The
label is replaced, not accompanied, and §4 gives the button its label's width.
From the 109px idle label, `생성 중…` measures 113 — four pixels. The two
alternatives cost more: keeping the label and adding §4's pulsing bolt beside it
measures 128, and so does `만드는 중…`. **The cheapest thing to say is the
button's own word.**

`불러오는 중…` is outside this rule. Nothing was pressed — it is a load that
began by itself, so there is no label to take a word from, and the verb form
stays.

**A retry sits on the seam, and `불러오는 중…` is still what it says.** It is
pressed, so the first reading gives `다시 시도 중…`; it loads, so the second
gives `불러오는 중…`. The screen settles it, and not in the label's favour:
**the button is gone by the time the text would change.** Asking again for data
that never arrived puts the query back into its first-load state, so the error
block — sentence and button together — is replaced by `불러오는 중…` for as
long as the attempt runs. There is no button left to relabel.

So the feedback for a pressed retry is **the whole block changing**, which is
louder than a word inside a 32px button, and this rule has nothing to add to
it. Two files carried `다시 시도 중…` and a disabled state on the assumption
that the button survives the press; neither ever rendered.

**This holds only while the six error blocks are shaped as they are** — the
loading branch first, the error branch second. That shape is not settled: it
was built against mocks, and how a failure reaches the screen is one of the
things the backend contract will decide. If a retry ever keeps its button, this
paragraph is what to revisit.

#### A failure names the verb that failed

**Every failure message is `~하지 못했어요`.** 불러오지 못했어요, 저장하지
못했어요, 삭제하지 못했어요, 로그인하지 못했어요.

The alternative is `~에 실패했어요`, and it is the more common one in the
product today — ten strings against four. It loses anyway, on the same test
that ruled out 합니다체: **it cannot cover one of the cases the product has.**
Nine messages report a read that failed and all nine say `불러오지 못했어요`.
To write those with 실패 you need a noun for the read — `조회에 실패했어요`,
`로딩에 실패했어요` — and neither word appears anywhere in this product.
`~하지 못했어요` covers reads and writes with one grammar.

It also agrees with the button rule two subsections up, which chose the verb
over the noun (`생성하기`, not `생성`). `저장에 실패했어요` turns that verb back
into a noun and hangs a postposition on it. **The same action is now the same
word in both places** — the button says `저장하기`, the failure says
`저장하지 못했어요`.

**The sentence that follows is fixed: `잠시 후 다시 시도해 주세요.`** Not
shortened, not dropped. Two strings omit `잠시 후` today and one omits the full
stop, for no reason either file records.

**What this costs.** Ten strings, and it retires a split the product had no
rule for.

#### Two smaller rules

**Spacing follows the standard's principal form.** `해 주세요`, not
`해주세요` — the auxiliary `주다` is written apart as the rule, and joining it
is a permission rather than the default. The product is already mostly there,
47 against 4. §6's label rule removed the other half of this question by
retiring `수정완료` / `수정 완료`.

**What goes into a field is `입력`.** `닉네임을 입력해 주세요`. `작성` is what
is done to a document; a single-line field takes input. Three strings say
`작성해주세요` today and are wrong on both counts at once.

#### A pass through a chapter is a 회독

**The chapter list says `1회독`, `3회독`.** Zero is `학습 전`, which §4 settled
separately.

`복습` was the other candidate and it fails on one case: **the first pass is not
a review.** Reading material for the first time is 학습, so a list that says
`복습 1번` names something that did not happen. This is the same shape of hole
that ruled out 합니다체 — a word that cannot cover one of the cases the product
actually has.

Splitting it — `학습 완료` for the first pass and `복습 2번` after — is accurate
and was rejected anyway. It puts three grammars in one slot, and §4 retired that
arrangement when it settled on one rule: zero is a word, the rest are numbers.

`회독` is the vocabulary of someone studying for an exam. That is who reads this
product, so it is the precise word for them rather than jargon they have to
learn.

**Nothing in §6 is undecided now.** The register, the button labels, the progress
text, the spacing, the verb for a field and the word for a pass are all above.

---

## 7. Governance

### Application priority

1. Direct user instructions for the requested scope.
2. This document.
3. The current state of the repository.

**The design file is no longer one of these.** The screens it holds are not the
screens being built, so it cannot be corrected into agreement and it cannot
govern where this document is silent. Where this document says nothing, the
question is open and is settled here before it is built.

It stays cited throughout this document, and those citations stay as they are.
They are the record of how each value was arrived at — which figure was measured,
which was declined and why — and that record does not stop being true when the
file stops being authoritative. **Read a citation as provenance, never as a source
to go back to.**

### Scope

**Whether the landing page is governed by this document is itself undecided, and
it is the prior question to every landing item here.**

§6 has already put the landing's copy outside: it addresses someone who is not a
user yet, in paragraphs rather than in lines, and it keeps the register it has.
The same argument may hold for the rest of it. If it does, the landing is not a
screen this system is missing values for — it is a surface this system does not
reach, and §3's scale and §5's phone version stop being open questions and become
questions for somewhere else.

**So no landing value is filled in on the assumption that it belongs here.** The
items marked undecided in §3 and §5 are recorded, not deferred.

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
