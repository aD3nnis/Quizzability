## me:
I want you to make note of this because I will come back to it: 

so what I want to focus on is the workflow. I want to have homescreen which has different buttons. to start it has just a "create new flashcard set" button. From that button it takes you to a new page where give flashcard set a title, and on same page ask  do you want to type or write set? when you click write it takes you to a single card. Thats the current workflow I want to have down so that I car start testing single card functionality

---
## cursor: 
Here’s a concise record of the workflow you described so you can pick it up later.

## Target workflow (for later)

1. **Home screen**  
   - Shows action buttons.  
   - **Initially:** one button — **“Create new flashcard set”**.

2. **After “Create new flashcard set”**  
   - Navigate to a **new page** where the user:  
     - **Names the set** (flashcard set title).  
     - On the **same page**, chooses how to build the set: **type** or **write**.

3. **If they choose “write”**  
   - Go to a **single-card** experience (the screen you want to use to **test single-card / drawing behavior**).

**Goal:** Get this navigation and page flow in place first, then iterate on **single-card** functionality in isolation.f

---

I’m in **Ask mode**, so I’m not changing the app or adding files—only capturing this. When you’re ready to implement routing and these screens, switch to **Agent mode** and we can wire it to your existing `App.tsx` / routes and `DrawingCanvas` (or whatever you use for the write path).

If you want this stored in-repo next time, say where you prefer it (e.g. a short section in `README.md` or an `ai-conversations` note) and we can add it in Agent mode.