## me: 
if there is no content within the svg meaning there is no stroke yet. I want to have a default text within it to start that days "write the term/question here" for the front side of the card
for the backside I want to say "write the description/answer here"
---

## cursor:
Here is a concise way to do it with your current setup.

## What you have

`DrawingCanvas` only renders `<path>` elements inside a fixed `viewBox="0 0 300 200"` (`DrawingCanvas.tsx`). `App.tsx` mounts two instances with different stroke arrays and draft visibility. “No content” means **`strokes.length === 0`** and, if you want the hint to disappear as soon as someone starts drawing, also **no in-progress draft** on that face (`activePoints` is only passed when `draftFace` matches, so you can treat “empty surface” as no paths and no draft for that canvas).

## Recommended approach: SVG `<text>`

Add an optional prop, for example `placeholder?: string`, and render a `<text>` when the surface is empty.

1. **Center in user space** (matches your viewBox): something like `x="150" y="100"` with `textAnchor="middle"` and `dominantBaseline="middle"` (or a small `dy` tweak for visual centering in some browsers).
2. **Use `pointer-events="none"`** on the placeholder so taps and drags still go to the SVG for drawing.
3. **Style** with `fill`, `opacity`, and a class or inline `fontSize` so it reads as a hint (e.g. muted gray, slightly smaller type).

**Front** (`App.tsx`): pass e.g. `placeholder="Write the term or question here"`.

**Back**: pass `placeholder="Write the description or answer here"`.

**When to show**:  
`showPlaceholder = strokes.length === 0 && activePoints.length === 0`  
(or equivalently: no stroke paths and no `draftD`). That way the hint disappears as soon as they put the pen down for the first stroke on that side.

## Alternatives (if you do not want `<text>`)

- **HTML overlay**: absolutely position a `<div>` over the card with the same “empty” condition. Slightly more layout/CSS work to keep it aligned with the SVG as the card scales, but easy for typography.
- **`<foreignObject>`**: HTML inside SVG; more awkward for simple hints.

For your case, **`<text>` inside the same SVG** is the smallest change and stays aligned with `preserveAspectRatio="xMidYMid meet"`.

---

I am in **Ask mode**, so I cannot edit the repo. If you switch to **Agent mode**, I can wire `placeholder` through `DrawingCanvas` and `App.tsx` with the exact strings you want.

---
## me: 
code: 
```
        {placeholder && !strokes.length && !draftD && !activePoints.length && (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="gray" opacity={0.5}>
            {placeholder}
          </text>
        )}
```
it says placeholder can not be found

---
## cursor: 
`placeholder` is declared on your props type (line 12) but it is **not pulled out of the props object** in the function parameters, so inside the component it is an undefined identifier.

On line 15 you have:

```15:15:frontend/src/components/DrawingCanvas.tsx
export default function DrawingCanvas({ strokes, activePoints, activeColor, svgPointerProps }: DrawingCanvasProps) {
```

Add `placeholder` to the destructuring:

```tsx
export default function DrawingCanvas({
  strokes,
  activePoints,
  activeColor,
  svgPointerProps,
  placeholder,
}: DrawingCanvasProps) {
```

If the hint should be optional sometimes, change the interface to `placeholder?: string` and either keep it in the destructuring (then it can be `undefined`) or use a default: `placeholder,` … and `placeholder?: string` with `{placeholder && ...}` which you already handle.

Also ensure `App.tsx` passes `placeholder="..."` on both `DrawingCanvas` instances; otherwise TypeScript will complain that the prop is missing (unless you make it optional).

I’m in **Ask mode** and cannot edit the file for you; if you want this applied automatically, switch to **Agent mode**.