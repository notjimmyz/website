---
name: animation
description: Use when building timeline transitions, drag interactions, scene transitions, scroll effects, or animated UI.
---

# Animation

Prefer Motion for complex React animation.

Use:
- Motion values for continuous timeline state
- useTransform for deriving visual state from timeline position
- drag gestures for timeline navigation
- AnimatePresence for entering/exiting content
- SVG animation when working with illustrations
- CSS transitions for simple hover effects

Animations should be smooth, subtle, and performant.

Avoid independent animations that fight each other.

For timeline-driven experiences, prefer one shared progress value
that multiple visual elements derive from.