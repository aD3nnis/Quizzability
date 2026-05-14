## me: 
I am able to write on one side of my card now I want to be able to flip the card and write on the other side. in my tech stack i have written down: | Animation | Framer Motion | Card flip animations; will look impressive in demos |

how would I implement this. Also note: should I first be thinking about storing the front side in my database before I get into the functionality of flipping the card to write on the other side?

---
## cursor: 
Here is a concise way to think about it, aligned with your repo and README.

## Implementing flip + drawing on both sides

**Framer Motion is not in your frontend yet** (`frontend/package.json` has no `framer-motion`). You would add it, then model the card as a **3D flip container** with two faces.

### UI structure

1. **Outer wrapper** — `perspective` (CSS) so rotation reads as 3D.
2. **Inner “card”** — `motion.div` with `rotateY` driven by state, e.g. `isFlipped ? 180 : 0`.
3. **Two faces** — absolutely positioned front and back, each **half** of the flip:
   - Front: `rotateY(0)` (or no extra rotation).
   - Back: `rotateY(180)` so it reads correctly when the parent is at 180°.
4. **CSS that matters for 3D** — on the flipping element and faces: `transform-style: preserve-3d`, and on each face `backface-visibility: hidden` so you only see one side at a time (and the “back” of a face is invisible during the turn).

Framer Motion’s role is mostly **animating** `rotateY` with spring or tween props (`animate={{ rotateY: … }}`, `transition={{ … }}`). The geometry is the same as a pure-CSS flip; Motion just makes the motion and gesture polish easier.

### Drawing state

Your `useDrawingEngine` today owns **one** `strokes` array:

```16:17:frontend/src/hooks/useDrawingEngine.ts
export function useDrawingEngine() {
  const [strokes, setStrokes] = useState<Stroke[]>([])
```

For two writable sides you typically:

- **Option A:** Two hook instances — `useDrawingEngine()` for front and one for back (each returns its own `strokes` / handlers). Wire the visible face’s `DrawingCanvas` to the matching instance.
- **Option B:** One hook extended to `{ frontStrokes, backStrokes, activeFace, … }` and route pointer handlers to the correct array.

Either way, **only the face that is “up”** should receive pointer events, or you should **disable** pointer events on the hidden face (`pointer-events: none` on the face with `backface-visibility: hidden` that is not toward the user — often easiest is toggling `pointer-events` on front/back based on `isFlipped`). That avoids drawing on the occluded side by accident.

### Order of work (flip vs persistence)

You do **not** need the database working before you can build flip + second-side drawing. Local React state shaped like your eventual API is enough.

Your README already sketches the persistence shape (`front_strokes` / `back_strokes` as `jsonb`) and a sensible build order: strokes feel good, then CRUD, then card UI with text and flip, then wire drawing to the API:

```322:331:README.md
Get strokes rendering and feeling good **before** connecting them to cards. Validate JSON round-trip. Build the eraser.

Define JPA entities (User, Deck, Card) and Spring Data repositories. Implement full CRUD via REST controllers. No drawing yet. Keep API versioned: `/api/v1/...`. Write at least basic integration tests — a backend with zero tests is a yellow flag to interviewers.

Create, edit, delete, view cards. Text input on front and back. Flip animation. Loading, error, and empty states.

Wire the drawing engine into the card editor. Front and back each have an SVG canvas alongside the text input. Strokes persist to the database.
```

**Practical recommendation**

- **First:** Front + back **stroke state** in the client (and flip + `pointer-events`), mirroring `front_strokes` / `back_strokes`. Optionally serialize to `localStorage` to mimic “save” without Spring yet.
- **Then:** Persist the same JSON shape through your API when the backend exists.

Waiting until “front is in the DB” before flipping is unnecessary; waiting until you know the **data shape** (two `jsonb` sides) is enough, and your README already defines that.

### Small demo note

README Phase 1 also mentions “flip animation … **CSS 3D transform**” as an alternative. Framer Motion is still appropriate if you want springs, drag-to-flip, or layout animations elsewhere; the flip itself is still fundamentally `rotateY` + `preserve-3d` + `backface-visibility`.

---

**Summary:** Add a 3D flip wrapper (Motion animates `rotateY`), give each face its own stroke state (or two drawing engines), and gate `pointer-events` by which side is active. You can build all of that before PostgreSQL; keep client state aligned with `front_strokes` / `back_strokes` so wiring persistence is a straight mapping later.

---
## me: 
ok lets start with fliping and go with option b: Option B: One hook extended to { frontStrokes, backStrokes, activeFace, … } and route pointer handlers to the correct array.

but what is the install comand for framer-motion?
---
## cursor: 
From your `frontend` folder (where `package.json` lives), use npm:

```bash
cd frontend && npm install framer-motion
```

If you use another package manager:

- **pnpm:** `pnpm add framer-motion`
- **yarn:** `yarn add framer-motion`

The package name is **`framer-motion`** (with a hyphen). It works with React 18+; your project uses React 19, which is compatible with current releases.