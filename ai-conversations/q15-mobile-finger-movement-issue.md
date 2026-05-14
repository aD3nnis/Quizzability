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