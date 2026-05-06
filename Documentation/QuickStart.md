# Quick Start: Developer Onboarding

## 1. Prerequisites
- Node.js 18+
- Anthropol Client Key (Get it from [Anthropol Dashboard](https://anthropol.io))

## 2. Installation
```bash
npm install @anthropol/sdk
```

## 3. Initialize the Engine
```typescript
import { Anthropol } from '@anthropol/sdk';

const auth = new Anthropol({
  publicKey: 'pk_live_...',
  shard: 'US-EAST'
});
```

## 4. Add the Verification UI
```tsx
import { HumanityOracle } from '@anthropol/react-ui';

function App() {
  return (
    <HumanityOracle 
      onAttested={(proof) => {
        console.log('Biological Humanity Verified:', proof.id);
        // Start user session
      }}
    />
  );
}
```

## 5. Deployment
- **Local:** `npm run dev`
- **Build:** `npm run build`
- **Dist:** Ensure your domain is allowlisted in the Anthropol Developer Portal under the "CORS/Origins" section.
