# Echelon Code Style Guide

This repository uses TypeScript and follows a simple formatting rule set to keep contributions consistent.

## General
- Use **two spaces** for indentation.
- Always terminate statements with a **semicolon**.
- Prefer `const` and `let`; avoid `var`.
- Keep import paths relative within a module. Use the `echelon/*` alias when importing from the framework itself.
- Use `function` declarations for decorators and exported helpers. Arrow functions are acceptable for class fields or callbacks.

## Decorators
- Decorator functions are organised in `src/core/decorators/`.
- Group decorators by purpose:
  - `class.ts` – `Component`.
  - `lifecycle.ts` – lifecycle method decorators.
  - `dom.ts` – DOM interaction decorators.
  - `state.ts` – state and store helpers.
  - `params.ts` – render method parameter decorators.
- New decorators should follow the existing pattern and use `getOrCreateComponentMeta` from `src/core/decorators/meta.ts`.

## Commit Messages
- Use the form `feat(area): description` or `fix(area): description`.
- Keep the message concise and written in English.

Run `npm run lint` and `npm test` before submitting changes.
