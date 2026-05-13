## me: 
I think the last thing i have to install is tailwind css for phase 1. One thing I'd like to point out is I like using Sass for styling. what do i have to change in order to use Sass for css structure?

---

## claude: 
Good call bringing this up before you start writing any styles. You have two real options here and they're not mutually exclusive.

---

## Option A: Sass Instead of Tailwind

Drop Tailwind entirely and just use Sass. Install it:

```bash
npm install -D sass
```

That's it — Vite has built-in Sass support, no plugin needed. Then rename your style files from `.css` to `.scss` and update the import in `main.tsx`:

```tsx
import './index.scss'
```

You get the full Sass feature set — nesting, variables, mixins, partials, `@use` and `@forward` for module structure.

---

## Option B: Tailwind + Sass Together

You can use both. Tailwind handles utility classes for layout and spacing, Sass handles your custom component styles and design tokens. Install both:

```bash
npm install -D sass @tailwindcss/vite tailwindcss
```

In your `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

Your `index.scss` becomes:

```scss
@import "tailwindcss";

// your custom Sass below
```

---

## My Honest Recommendation

For this project specifically, **Sass alone is the cleaner choice**. Here's why:

Tailwind's value is speed — you don't leave the JSX to write styles. But you have a design-forward sensibility and you're already comfortable with Sass from your professional work. The drawing canvas, card flip animations, and overall UI of this app will benefit from the kind of structured, intentional CSS that Sass encourages. Tailwind can feel constraining when you're doing custom visual work.

You also don't want to be learning Tailwind's utility class system at the same time as building a drawing engine and learning Spring Boot. That's too many new things at once.

Go with Sass, keep it clean, and add Tailwind to a future project where speed of layout is the priority.

---

## me: 
ok I want to go ahead and just use sass to start, what is the install comand?

---

## claude: 
From inside your `frontend/` directory:

```bash
npm install -D sass
```

Then rename `src/index.css` to `src/index.scss` and update the import in `main.tsx` from:

```tsx
import './index.css'
```

to:

```tsx
import './index.scss'
```

Also rename `src/App.css` to `src/App.scss` and update that import in `App.tsx` the same way. Vite picks up the change automatically — no config needed.