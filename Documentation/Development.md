# Development Guidelines: Institutional Standards

## 1. Coding Philosophy
Every line of code at Anthropol serves the mission of **Biological Integrity**. 
- **Readability:** Prioritize crystal-clear frequency recovery logic over dense optimizations.
- **Safety:** Never use `any`. Treat every external signal as a potential attack vector.

## 2. Conventions
- **Naming:** 
  - Components: `PascalCase.tsx`
  - Helpers/Services: `camelCase.ts`
  - Types: `PascalCase` in `types.ts`
- **Styling:** Use Tailwind Utility-First. Maintain the "Institutional Brutalist" aesthetic (Dark mode, neon accents, high contrast).

## 3. Pull Request Protocol
1. **Adversarial Audit:** Every PR changing the `BioOpticEngine` must include an adversarial audit: "Could an AI-generated deepfake bypass this change?"
2. **Linting:** Must pass `npm run lint` (TypeScript strict mode).
3. **Documentation:** Any changes to the API must be reflected in `/Documentation/API.md` before merge.

## 4. Testing
- **Liveness Tests:** Use the `StressTest.tsx` component to verify signal recovery across varying light intensities and resolution constraints.
- **Security Rules:** Test all Firestore operations against the `security_spec.md` requirements.
