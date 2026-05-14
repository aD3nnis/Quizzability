# Notecard App — Project Planning Document

> A cross between Quizlet and Notability. Users can create stacks of notecards with typed text and/or freehand drawing (mouse, Apple Pencil, or finger), study them in shuffle mode, and eventually generate cards from PDFs using AI.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Career Context](#career-context)
3. [Tech Stack](#tech-stack)
4. [Core Features](#core-features)
5. [The Central Architecture Decision](#the-central-architecture-decision)
6. [Drawing Engine — SVG Path-Based (Vector)](#drawing-engine--svg-path-based-vector)
7. [Data Model](#data-model)
8. [Study Mode](#study-mode)
9. [Build Order](#build-order)
10. [What This Project Signals to Interviewers](#what-this-project-signals-to-interviewers)
11. [Future Iterations](#future-iterations)

---

## Project Overview

A notecard study app with handwriting support. The distinguishing feature is the ability to write on cards using:

- A mouse (desktop)
- An Apple Pencil (iPad)
- A finger (phone)

All three input types are handled by a single unified drawing engine using the browser's **Pointer Events API** — no separate code paths per device.

Users can organize cards into decks, study them in shuffle mode, and (in a future iteration) generate cards from a chunk of text or PDF using AI.

---

## Career Context

This project is being built for a **portfolio targeting Series B full stack engineering roles**, with a frontend-heavy background in Vue 3, JavaScript, PHP, and WordPress. The goal is to demonstrate:

- React fluency (cross-framework adaptability)
- Full stack ownership (frontend → API → database)
- Engineering maturity through deliberate architectural decisions
- Depth over breadth — one strong, deployed, finished project

### What makes a portfolio project stand out at Series B companies

- A clear "why" — what problem does this solve and for whom?
- Deliberate tradeoffs you can articulate in interviews
- A live deployed URL you can demo
- Frontend craft: accessibility, responsive design, loading/error/empty states
- Clean API contracts and proper error propagation from DB up through the UI
- A strong README with architecture decisions and honest notes on what you'd improve

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + TypeScript | Market relevance; component model suits card UI well; shows Vue → React adaptability |
| Styling | Sass CSS | Utility-first, widely used in the industry |
| Animation | Framer Motion | Card flip animations; will look impressive in demos |
| Drawing | Custom SVG drawing engine via React | Keep drawing logic in a custom hook; SVG renders inside JSX naturally |
| Stroke Smoothing | Perfect Freehand (library) | Industry-standard, pressure-aware, outputs SVG-compatible polygon data |
| Backend | Spring Boot 3 (Java) | Type-safe, structured, enterprise-relevant; signals backend seriousness; differentiates from prior Node projects |
| ORM | Spring Data JPA + Hibernate | Handles relational mapping cleanly; repositories give CRUD for free |
| Auth | Spring Security | Industry-standard, full-featured; mirrors what you'd encounter professionally |
| Database | PostgreSQL | Relational, structured; `jsonb` column for stroke data |
| File Storage | Not needed (strokes stored as JSON directly in DB) | Vector approach eliminates the need for S3/Cloudinary |
| Deployment | Railway or Render (backend) + Netlify or Vercel (frontend) | Both support Java/Spring Boot; Railway is particularly smooth for Spring |

### Why Spring Boot over Node/Express

Your resume already has a deployed Node/Express/PostgreSQL project. Another one doesn't move the needle. Spring Boot is a genuine differentiator — it signals backend seriousness in a way that Express (which is minimal by design) doesn't.

Concrete advantages for this project specifically:

- **Type safety end to end.** Java on the backend plus TypeScript on the frontend gives you compile-time guarantees across the full stack. As the data model grows — strokes, decks, cards, users, study sessions — this prevents a class of runtime bugs that untyped Express apps are prone to.
- **Structure at scale.** Express gives you nothing by default. Spring Boot enforces an architecture that holds up as complexity grows. Coming back to this project in six months, the codebase will be easier to reason about.
- **Spring Data JPA.** The relational model here (users own decks, decks own cards) maps cleanly to JPA entities. Repositories give you CRUD operations and expressive queries without raw SQL everywhere.
- **Spring Security.** A more complete, professional auth solution than stitching together JWT libraries in Express.
- **Career transferability.** Java is the dominant language in enterprise backends, Android, fintech, and large-scale systems — all sectors with strong hiring. It broadens your surface area beyond the JavaScript ecosystem.

### Ramp-Up Strategy

Spend one to two weeks building a throwaway CRUD API in Spring Boot before starting the notecard project. Learn the application context, dependency injection, and JPA in isolation. Then you're not learning the framework and the product simultaneously.

### Why React over Vue

Your Vue experience transfers conceptually (components, reactivity, lifecycle). React is the dominant framework in the current job market. Showing you can work in both demonstrates adaptability, which is a genuine differentiator.

---

## Core Features

### MVP (Phase 1)

- Create a notecard with front and back
- Each side supports typed text and/or freehand drawing
- Create, read, update, and delete individual cards
- Organize cards into named decks
- Create, rename, and delete decks

### Study Mode (Phase 2)

- Shuffle cards (Fisher-Yates algorithm, client-side)
- Flip animation between front and back (CSS 3D transform)
- Mark cards as "known" or "still learning"
- Keyboard shortcuts: spacebar to flip, arrow keys to navigate

### AI Layer (Phase 3)

- Upload a PDF or paste a block of text
- AI generates a deck of notecards from the content
- Optional: AI suggests what to write on each card, rendered as a ghost SVG path the user can trace over

---

## The Central Architecture Decision

Every notecard side can contain two fundamentally different content types:

- **Typed text** — structured, stored as a string, queryable
- **Handwriting** — unstructured, visual, stored as vector path data (JSON)

These two live side by side on each card face. The data model must separate them from the start. Do not try to merge them into a single field.

### Why SVG Path-Based (Vector) over Canvas (Raster)

| | Canvas / Raster | SVG Path / Vector |
|---|---|---|
| Storage | PNG image file (S3/Cloudinary) | JSON in PostgreSQL `jsonb` column |
| Scalability | Degrades on zoom | Infinitely scalable |
| Editability | Cannot edit after saving | Erase individual strokes |
| Searchability | Opaque blob | Structured data |
| AI compatibility | Hard to process | Can feed stroke data directly to AI |
| Complexity | Simpler MVP | More upfront work, higher ceiling |

**Decision: SVG Path-Based from day one.** The architecture complexity is manageable, and the long-term benefits — especially for the AI layer — are significant.

---

## Drawing Engine — SVG Path-Based (Vector)

### How It Works

Instead of painting pixels, you record a sequence of points as the user draws and convert them into an SVG `<path>` element.

```
pointerdown  → start a new stroke, record first point
pointermove  → append points to the current stroke
pointerup    → finalize the stroke, save it to state
```

Each completed stroke is one SVG path. A full drawing is an array of strokes.

### What a Stroke Looks Like in Data

```json
{
  "id": "stroke_001",
  "points": [
    { "x": 120, "y": 45, "pressure": 0.6, "timestamp": 1715000000 },
    { "x": 124, "y": 48, "pressure": 0.72, "timestamp": 1715000016 },
    { "x": 129, "y": 53, "pressure": 0.81, "timestamp": 1715000032 }
  ],
  "color": "#1a1a1a",
  "tool": "pen"
}
```

A card's drawing is an array of these stroke objects, stored as `jsonb` in PostgreSQL.

### The Pointer Events API — One Handler for All Input Types

Do **not** write separate code for mouse, Apple Pencil, and finger. The browser's Pointer Events API unifies all three:

```javascript
canvas.addEventListener('pointerdown', handleStart);
canvas.addEventListener('pointermove', handleDraw);
canvas.addEventListener('pointerup', handleEnd);
```

The `pointerType` property tells you what device is being used: `"mouse"`, `"pen"`, or `"touch"`. The `"pen"` type exposes `event.pressure` (0–1) and tilt data from the Apple Pencil.

**Important:** Call `event.preventDefault()` on touch events on your drawing surface to prevent the browser from intercepting the gesture as a scroll.

**Important:** Call `svgRef.current.setPointerCapture(e.pointerId)` on `pointerdown`. This keeps the element receiving events even if the pointer leaves the SVG bounds mid-stroke.

### Pressure → Stroke Width

```javascript
const minWidth = 1.5;
const maxWidth = 6;
const width = minWidth + (pressure * (maxWidth - minWidth));
```

For mouse input, `event.pressure` is always `0.5`. You can optionally simulate pressure from pointer velocity (fast = thin, slow = thick) as a later enhancement.

### Stroke Smoothing

Raw pointer events produce jagged, angular lines. The fix is Bezier curve smoothing — computing smooth curves through your recorded points rather than drawing straight lines between them.

**Use the Perfect Freehand library** rather than implementing this from scratch. It handles:
- Catmull-Rom to Bezier conversion
- Pressure-based stroke width variation
- Outputs a polygon renderable as an SVG path

Using a well-maintained library here is a legitimate engineering judgment and worth mentioning in interviews.

### The SVG Canvas Component (Sketch)

```jsx
function DrawingCanvas({ strokes, onStrokeComplete }) {
  const [activePoints, setActivePoints] = useState([]);
  const svgRef = useRef(null);

  const handlePointerDown = (e) => {
    e.preventDefault();
    svgRef.current.setPointerCapture(e.pointerId);
    setActivePoints([{ x: e.offsetX, y: e.offsetY, pressure: e.pressure }]);
  };

  const handlePointerMove = (e) => {
    if (activePoints.length === 0) return;
    setActivePoints(prev => [
      ...prev,
      { x: e.offsetX, y: e.offsetY, pressure: e.pressure }
    ]);
  };

  const handlePointerUp = () => {
    if (activePoints.length > 0) {
      onStrokeComplete(activePoints); // lift completed stroke to parent
      setActivePoints([]);
    }
  };

  return (
    <svg
      ref={svgRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {strokes.map(stroke => (
        <SvgStroke key={stroke.id} points={stroke.points} />
      ))}
      {activePoints.length > 0 && (
        <SvgStroke points={activePoints} isActive />
      )}
    </svg>
  );
}
```

### Erasing

Erasing on a vector system means **removing a stroke from the array** — not painting white pixels. The eraser tool checks if the pointer intersects a stroke's bounding box and filters it out of state.

A more advanced stroke-split eraser (cuts a stroke into two segments around the erased region) is a later iteration — achievable because you have the underlying point data.

---

## Data Model

### Schema

```
User
  └── Decks
        ├── id
        ├── title
        ├── description
        ├── color / tag
        └── created_at

        └── Cards
              ├── id
              ├── deck_id (FK)
              ├── position / order
              ├── front_text:         string | null
              ├── front_strokes:      jsonb  | null   ← array of stroke objects
              ├── back_text:          string | null
              ├── back_strokes:       jsonb  | null
              ├── created_at
              └── updated_at
```

### Key Decisions

- Each card side is independently text, drawing, or both
- Strokes are stored directly as `jsonb` — no file storage service needed
- This means drawings are queryable, transformable, and versionable
- The AI layer can consume stroke JSON directly rather than parsing an opaque image

### Confirming Round-Trip Integrity

Before building anything else on top of the drawing engine, verify that your JSON round-trips correctly:

```
Draw something → serialize strokes to JSON → save to DB → reload → deserialize → render
```

The output must look identical to what was drawn. Do this before connecting the drawing engine to the full card UI.

---

## Study Mode

- **Shuffle:** Fisher-Yates algorithm applied to the card array client-side
- **Flip:** CSS 3D transform (`rotateY`) wrapped in a Framer Motion animation
- **Progress tracking:** "Known" vs "still learning" piles within a session
- **Keyboard shortcuts:** Spacebar to flip, arrow keys to navigate — small detail, significant UX impact

---

## Build Order

### Phase 1 — Drawing Engine in Isolation
Get strokes rendering and feeling good **before** connecting them to cards. Validate JSON round-trip. Build the eraser.

### Phase 2 — Data Model + REST API
Define JPA entities (User, Deck, Card) and Spring Data repositories. Implement full CRUD via REST controllers. No drawing yet. Keep API versioned: `/api/v1/...`. Write at least basic integration tests — a backend with zero tests is a yellow flag to interviewers.

### Phase 3 — Card UI
Create, edit, delete, view cards. Text input on front and back. Flip animation. Loading, error, and empty states.

### Phase 4 — Connect Drawing to Cards
Wire the drawing engine into the card editor. Front and back each have an SVG canvas alongside the text input. Strokes persist to the database.

### Phase 5 — Deck Management
Create, rename, delete decks. Navigation between decks.

### Phase 6 — Study Mode
Shuffle, flip, session progress tracking, keyboard shortcuts.

### Phase 7 — AI Layer
PDF upload or text paste → AI generates a deck of cards. This is the "wow" demo feature — a complete picture of the full stack: file upload → backend processing → API call → database write → frontend render.

---

## What This Project Signals to Interviewers

Done well, this project demonstrates:

- Custom pointer input handling across mouse, stylus, and touch
- SVG rendering and vector graphics fundamentals
- Real-time-feeling UI with meaningful animations
- Multi-entity relational data model with mixed content types
- Spring Boot backend with JPA, proper layering (controller → service → repository), and tested endpoints
- Spring Security auth integration
- Full stack ownership from database schema to UI component
- AI feature integration (Phase 3)
- A deployed, live, demoed product

That is an unusually complete picture for a junior portfolio project, and every piece of it is something you will be asked about in interviews.

---

## Future Iterations

- **Guided tracing:** AI suggests card content and renders it as a ghost SVG path the user traces over
- **Stroke animation:** Replay a card being written, stroke by stroke
- **Collaborative decks:** Share a deck with another user
- **Export:** Export a deck as a PDF with printed card fronts and backs
- **WebSocket support:** Real-time collaborative editing using Spring's WebSocket support

---

*Last updated: May 2026*