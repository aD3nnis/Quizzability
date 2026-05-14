## me: 
give me a setp by step guide on how I should do/approach using the flip animation using option b
---
## cursor: 
Here is a practical sequence that matches **Option B** and your current `useDrawingEngine` + `DrawingCanvas` setup.

---

### 1. Install Framer Motion

In `frontend`: `npm install framer-motion`.

---

### 2. Decide how “which side am I drawing on?” is chosen

Two consistent approaches:

- **A. Flip drives the face:** `isFlipped` → `activeFace` is `'back'` when flipped, `'front'` otherwise. Only the **visible** face’s SVG gets pointer handlers (or gets `pointer-events: auto`; the hidden face gets `none`).
- **B. Event drives the face (more explicit):** each `DrawingCanvas` is tagged `face="front" | "back"` and handlers are `handlePointerDown(face, e)`. On `pointerdown`, stash `gestureFaceRef.current = face` and use that for the whole gesture through `pointerup` (so a mid-stroke flip does not corrupt data).

You can combine A + B: visible face only, plus `gestureFaceRef` on down for safety.

---

### 3. Extend the hook’s state (Option B core)

Replace the single `strokes` / `activePoints` pipeline with something shaped like your future DB:

- `frontStrokes`, `backStrokes`: `Stroke[]`
- **Draft while drawing:** either  
  - one `activePoints` + `gestureFaceRef` on pointer down, or  
  - `activePointsFront` / `activePointsBack` (only one populated at a time).

Keep **one** `draftRef` / `isDrawingRef` pair if you use a single draft buffer; on commit, append to `frontStrokes` or `backStrokes` based on the face for that gesture.

Replace `setStrokes` in `endGesture` with something like `setFrontStrokes` / `setBackStrokes` based on that face.

- `clearStrokes` becomes `clearFace('front' | 'back')` or clear both, depending on what you want for testing.

Color/tool can stay global for now, or become per-face later.

---

### 4. Route handlers through one place

Do **not** duplicate four big handler bodies. Keep:

- `endGesture(e, commit, face)`
- `handlePointerDown(face, e)` → set capture, init draft, set active points for **that** face
- `handlePointerMove` / `Up` / `Cancel` → use `gestureFaceRef.current` (set on down) so move/up always hit the correct arrays

Return something like:

- `frontStrokes`, `backStrokes`, `activePointsFront`, `activePointsBack` (or one `activePoints` + `activeGestureFace` for the draft preview)
- `svgPointerPropsFront` / `svgPointerPropsBack` **or** a factory `getSvgPointerProps(face)`

---

### 5. Add flip state next to drawing state

Either in the same hook or in a small parent:

- `isFlipped: boolean`
- `toggleFlip()` or `setIsFlipped`
- Derive `activeFace: 'front' | 'back'` from `isFlipped` if you use flip-driven visibility

Framer Motion only needs `isFlipped` (or a numeric `rotateY`); it does not need to own stroke state.

---

### 6. Build the 3D card shell (Framer Motion)

1. Outer div: `perspective: …px` (CSS).
2. `motion.div` (the rotating slab): `style={{ transformStyle: 'preserve-3d' }}`, `animate={{ rotateY: isFlipped ? 180 : 0 }}`, `transition={{ … }}`.
3. Two inner faces (absolute, same size):  
   - Front face: content at `rotateY(0)`, `backfaceVisibility: 'hidden'`.  
   - Back face: wrapper at `rotateY(180)` so it reads upright when the parent is at 180°, also `backfaceVisibility: 'hidden'`.

Put one `DrawingCanvas` inside the front face, one inside the back, each with the correct `strokes`, `activePoints`, and `svgPointerProps` from the hook.

---

### 7. Pointer events and hit testing

- Hidden face: `pointer-events: none` (or only enable the visible canvas) so you never draw on the “wrong” layer.
- Keep `touch-action: none` on the active SVG (you already have it) to reduce browser scrolling while drawing.

---

### 8. Wire `App` (or a `Flashcard` component)

- One call to the extended hook.
- Render the flip shell + two canvases + a **Flip** control (button or tap on a non-drawing chrome area).
- Optional: **Space** toggles flip for study mode later; for the editor, a button is enough to start.

---

### 9. Verify behavior in order

1. Draw on front → flip → front ink stays put, back is empty.  
2. Draw on back → flip → both sides retain their strokes.  
3. Rapid flip with finger down: no crash, no stroke attached to the wrong array (gesture face ref fixes this).  
4. Build passes: `npm run build`.

---

### 10. Defer until after flip works

- DB / API persistence (same JSON shape as `frontStrokes` / `backStrokes` later).
- Eraser per face (same routing idea: mutate the correct array).

---

**Order summary:** extend the hook (dual stroke stores + face-scoped gesture) → add flip state + 3D layout + Motion → two `DrawingCanvas` instances with props per face → tighten pointer / `gestureFaceRef` → then persistence when you are ready.

If you want this captured in `ai-conversations/q18-howto-flip-freehand-card.md`, switch to Agent mode and ask to append it; Ask mode here is guidance only.