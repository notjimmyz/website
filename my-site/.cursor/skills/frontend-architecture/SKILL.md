---
name: frontend-architecture
description: Use when designing components or architecture for substantial frontend features.
---

# Frontend Architecture

Prefer data-driven architecture over hardcoding individual scenes.

For timeline experiences:

Timeline state
→ scene state
→ rendered environment

Keep timeline/navigation logic separate from scene visuals.

Prefer reusable concepts such as:

- Timeline
- Scene
- Environment
- Landmark
- Character
- InteractiveObject
- ContentOverlay

Avoid large monolithic page components.

Do not over-engineer abstractions before multiple scenes actually need them.