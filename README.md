# Construction Tasks App

Minimal offline-first React app for creating construction tasks on a floor plan.

## Features

- Login-light (username only, per-user data separation) ~ 1 hour
- Plan view with floor plan image ~ 1 hour
- Add tasks (shown on plan and in list) ~ 1.5 hours
- Edit and delete tasks: ~ 0.5 hours
- Offline-first: all data local (IndexedDB) ~ 0.5 hours

Additional time spent: Project Setup, Testing, Fine-tuning & Handover: ~ 1-2 hours

## Tech Stack

- React (latest)
- TypeScript (strict mode)
- Zustand
- RxDB (no sync helper)
- React Router
- TailwindCSS

## Floor Plan

Place your floor plan image in `public/image.png`.

---

## Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`

---

## Todos (open tasks due to limited time)

Functionality:

- Canvas instead of an image and absolutely positioned tasks
- Lack of design due to focus on functionality, remember that I only had 1 day
- PWA / mobile-friendlyness, this version was only tested on Desktop
- Sorting tasks by timestamp or status (uncompleted first)
- Translations instead of hardcoded strings (buttons/UI)
