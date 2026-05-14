## me: 
on the website on mobile I have a problem. The space outside on the svg which i think is just the space of the app can be moved around when I place my finger on the svg. Let me know if this description needs more claification because it is not an easy problem to describe. So I can get pen movement on the square but only if my finger is very intentionally with slowing down and not moving the svg box around 

---

## cursor: 
Your description is clear enough: on mobile, **the page (or the area around the drawing surface) scrolls or shifts while you are trying to draw**, so you only get a stable stroke if you move very slowly and deliberately. That is a very common issue, not an unclear one.

## What is going on

On phones, the browser treats most drags as **pan/scroll** unless you tell it otherwise. Your drawing layer uses **Pointer events** and already calls `preventDefault()` on **pointer down** and uses **pointer capture** (`useDrawingEngine.ts`), which helps, but two things still often leave room for the browser to “steal” the gesture:

1. **No `touch-action` on the SVG**  
   Without something like `touch-action: none`, many browsers still allow **scrolling/panning** from touches that started on that element. `preventDefault()` on `pointerdown` alone does not always stop that the way people expect; **`touch-action` is the usual fix** for “I want this surface to own the finger, not the document.”

2. **Your SVG may not fill the screen**  
   In `DrawingCanvas.tsx` the `<svg>` has no `width`/`height`/`className` with dimensions. In HTML, an SVG with no explicit size often gets the **default intrinsic size (300×150 CSS pixels)**. Your wrapper in `App.tsx` is `100vw` × `100vh`, but the SVG itself can still be a **small rectangle** (your blue `cornflowerblue` area). Anything outside that is just the div/page—**those touches will scroll the page normally**, which matches “space outside the svg … can be moved around.”

So you may be seeing **two related effects**: panning when touching outside the small SVG, and **even on the SVG** weak competition between draw and scroll until the gesture is slow enough that the browser commits to one behavior.

## How to make the problem easier to talk about (if you ever need to)

Useful labels for support or issues:

- **“Touch scrolling conflicts with pointer drawing on the canvas.”**
- **“Need `touch-action: none` (or equivalent) on the drawing surface.”**
- **“Drawing surface should be full viewport; currently SVG may be default 300×150.”**

## What you would change (conceptually; Ask mode — I’m not editing your repo)

- Set **`touch-action: none`** on the interactive drawing element (the `<svg>` or a full-screen overlay), so the browser does not use that contact for document scrolling.
- Make the **SVG match the layout size** you want (e.g. `width: 100%`, `height: 100%`, `display: block`) so there is no large “dead” area that still scrolls.
- Optionally add **`overscroll-behavior: none`** on `html`/`body` or the scroll container to reduce rubber-band scrolling chaining on iOS (secondary to `touch-action`).

Your description does **not** need more clarification for diagnosis; it already points to **touch gesture routing** (scroll vs draw) and possibly **SVG not covering the full viewport**. If you want this applied in the project, switch to Agent mode and we can wire `touch-action` and sizing in the right files.

--- 
## me: 
that did not work using just touch-action. One thing i want to try is the div surrounding svg has width and a height i want to get rid of or manipulate. Where is that defined?

---
## cursor: 
That wrapper is defined inline in `App.tsx`: the root of your `App` component wraps `DrawingCanvas` in a `div` with `width: '100vw'` and `height: '100vh'`.

```12:19:/Users/avadennis/Documents/learning-career-focused/projects/Quizability/frontend/src/App.tsx
        <div style={{ width: '100vw', height: '100vh' }}>
          <DrawingCanvas 
            strokes={strokes} 
            activePoints={activePoints} 
            activeColor={currentColor} 
            svgPointerProps={svgPointerProps} 
          />
        </div>
```

`DrawingCanvas.tsx` does not add another div; it only renders the `<svg>`. So any change to that outer box is entirely in `App.tsx` (or whatever parent you later wrap the app with, e.g. `main.tsx` → `#root`).

---
## me: 
adding overscroll-behavior: none; to :root fixed trhe problem but i think i want that to be a style specifc to the phase of the card where a person is going to write on the card. That style i want in its own scss file. I think a title that makes sense for now would be active-freehand-card or something. How should I think about setting up that toggle? Here is the workflow I am thinking. User selects make flashcard set -> chooses freehand -> first card appears to write and thats when :root becomes overscroll-behavior: none;

---
## cursor: 
Here is a concise way to think about it.

## What you are really toggling

`overscroll-behavior` only affects how scrolling **at scroll boundaries** behaves (and related chaining). It applies to **scroll containers**. On many mobile browsers, the meaningful scroll container for “page bounce” is still effectively the **viewport / document**, so the rule usually has to live on something that participates in that chain: most often **`html`**, sometimes **`body`**, not only a deep inner `.card` div.

So “phase-specific” does not mean “only inside the card component in the DOM tree.” It means: **only while this phase is active, we attach a class (or data attribute) on a root-level element** and your SCSS targets that. The **logic** of when that happens lives in React (or your router); the **look** lives in your new file.

## File and naming

A dedicated file is a good idea. Names that age well describe the **phase or surface**, not only one property, for example:

- `freehand-writing-phase.scss`  
- or `active-freehand-card.scss` (your idea is fine)

Inside, prefer a **single hook class or attribute** so the file stays obvious:

```scss
// Concept only — you would implement in Agent mode
html.freehand-writing-phase {
  overscroll-behavior: none;
}
```

Import that file **once** (e.g. from `main.tsx` next to `index.scss`, or from the layout that owns flashcards) so the rules exist globally, but they only **apply** when the class is present.

## How to toggle it in the workflow

**State-driven class on `document.documentElement` (`<html>`)** is the usual pattern:

1. You have app state or a route like: idle → creating set → chose freehand → **first card writing**.
2. When you enter **“first card writing”** (and any later cards in the same mode, if you want the same behavior), run an effect that adds `freehand-writing-phase` to `<html>`.
3. When the user leaves that mode (back, finish set, switch to typed cards, etc.), remove the class in the effect cleanup.

That gives you:

- **One source of truth**: React phase / URL.
- **No global accidental lock-in**: class removed when the phase unmounts or changes.
- **Co-located styles**: the SCSS file documents “everything we do to the page while freehand is active” (later you might add `touch-action`, `overflow`, safe-area, etc. in the same hook).

Alternative: put `data-app-phase="freehand-writing"` on `html` and use `[data-app-phase="freehand-writing"]` in SCSS — same idea, slightly easier to grep in DevTools.

## What not to rely on alone

- **Only a class on the card div**: may help for scroll chaining *inside* a nested scroll area, but often does not replace `html`/`body` behavior for full-page overscroll on phones.
- **Only `:root` in a static stylesheet**: always on; you wanted phase-specific, so move the selector to `html.phase-name` (or `html[data-phase="..."]`).

## Summary mental model

| Piece | Role |
|--------|------|
| **Route / wizard step / context** | Decides “are we in freehand writing?” |
| **`useEffect` (+ cleanup)** | Adds/removes class on `document.documentElement` |
| **`freehand-writing-phase.scss` (name TBD)** | Defines what `html.freehand-writing-phase { ... }` does |

That matches your workflow: after **make set → freehand → first card shown for writing**, enter the phase and add the class; when they leave, remove it. If you later split “browsing deck” vs “writing on card,” you can use two classes or one enum-like `data-phase` and keep one SCSS file with multiple blocks.

I am in **Ask mode**, so I cannot add the file or effect for you; in **Agent mode** you could have this wired to your actual step state or routes in one pass.