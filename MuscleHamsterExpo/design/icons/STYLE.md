# Muscle Hamster icon style

37 hand-authored icons for the Storybook redesign. Files: `svg/<name>.svg`. Preview: `sheet.png` (each icon at 64, 28 and 20 px).
`build.mjs` is the source the SVGs are generated from (`node build.mjs svg`). Edit it rather than hand-editing the SVGs so the hamster and strokes stay identical everywhere.

## Grid
- `viewBox="0 0 48 48"`, no width/height. Keep **3 units of padding** (live area 3–45, stroke edge included).
- One clear silhouette per icon. Nothing that matters is smaller than 2 units. If it disappears at 20 px, delete it.
- Allowed elements: `path circle ellipse rect line polyline polygon g` with inline attributes. `g transform` (translate / rotate / mirror) is fine. No text, filters, gradients, masks, opacity, `<style>` or external refs.

## Stroke
- Outline: ink `#4A3728`, **2.5**, round caps and joins. Every filled shape gets the full outline.
- Facial features and small inner details: 2 (1.6 on small heads). Inner details never go above 2.5.
- **Limbs** are capsules: an 8-wide ink stroke with a 3-wide colour stroke on top, so they carry the same 2.5 outline as everything else.
- No light source, no shading, no shadows. Flat fills only. A single white highlight stroke (ice, ball) is the most "shine" we allow.

## Palette
| Token | Hex | Use |
|---|---|---|
| ink | `#4A3728` | outlines, eyes, pips, footprints |
| brand orange | `#FF9500` | hamster fur, the hero shape |
| white | `#FFFFFF` | hamster face/belly, paper, labels |
| peach | `#FFE3B8` | food, joints |
| sand | `#F3E6D6` | neutral objects (gear, ID clip) |
| mint | `#DDF2D8` | mats, leaves, done ticks |
| sky | `#D9EEF2` | water, ice, pillow, silver tier |
| **coral** (accent) | `#F2777A` | hearts, the headband, inner ears, cheeks, nose, ribbons, flag |
| **gold** (accent) | `#FFC93C` | sun, coins, bells, trophies, gold medals, sparkles, flame core |

Why two accents: coral is the hamster's own colour (headband, ears, cheeks), so hearts and rewards feel like they came from him. Gold is the only reward/celebration colour, so "gold" always means "you earned something".
Medal tiers: orange = bronze (2,500 steps), sky = silver (5,000), gold = gold (10,000). Footprint count and the flag also change, so colour is never the only cue.

## The hamster
Built from one function (`head()` in `build.mjs`). Same parts in every icon, only the scale `k` and the expression change.
- **Head:** chubby round shape, 30 × 25.5 at k = 1, widest just under the eyes.
- **Ears:** small orange circles at the top corners, half hidden behind the head, coral inner dot.
- **Face:** white lower face. The orange dips into a soft V between the eyes.
- **Headband:** coral band across the brow. This is the signature, so always include it. Below k = 0.75 it loses its inner outline and becomes a plain coral stripe.
- **Eyes:** ink dots with one white glint. **Nose:** coral oval. **Mouth:** small "w". **Cheeks:** coral ovals.
- **Expressions:** `smile` (default), `happy` (open mouth + buck tooth), `hungry` (big glossy eyes, licking lips), `sleep` (closed arcs), `squeeze` (^ ^ joy), `breath` (closed eyes, "o" mouth).
- **Body:** orange oval with a white belly oval. Feet are small orange ovals. Paws are orange dots (r ≈ 3).
- Proportions: chibi. The head is always bigger than the body. In full-body icons use head k ≈ 0.7–0.8.
- Head-only ("bust") icons: arms rise from behind the head (strength, stretching).

## Do
- Lead with one big shape (bag, heart, medal, head), then add at most one supporting prop.
- Reuse the shared parts: `heart`, `paw`, `sneaker`, `sparkle`, `arcArrow`, `medal`, `limb`.
- Check the 20 px render and the 40 % opacity render (tabs) before calling an icon done.

## Don't
- No new colours, no gradients, no thin hairline details, no words or numbers inside icons.
- Don't redraw the hamster freehand. Use `head()`.
- Don't put a hamster in an icon that is only a control (close, back, play). Those stay stock.
- Don't rely on colour alone to tell two icons apart.
