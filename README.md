# Construction Tasks App

Minimal offline-first React app for creating construction tasks on a floor plan.

## Features

- Login-light (username only, per-user data separation) ~ 1 hour
- Plan view with floor plan image
- Add tasks (shown on plan and in list)
- Offline-first: all data local (IndexedDB)

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

- do not use an image and position absolute for the tasks, instead canvas elements stacked on each other
- layout of course, it's just a demo
- PWA mobile-friendlyness, this version was only tested on Desktop
- translations instead of hardcoded strings (buttons/UI)
