---
description: Coding standards and project structure rules for Wedding Planner app
---

# Wedding Planner - Coding Standards

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Primitive UI (Button, Card, Input, Modal, etc.)
│   └── layout/          # Layout components (BottomNav, Header, etc.)
├── pages/               # Page-level components (one per route)
├── hooks/               # Custom React hooks (shared logic)
├── lib/                 # Utility functions and helpers
├── shared/              # Shared between frontend & backend
│   ├── types/           # TypeScript interfaces & DTOs
│   └── constants/       # Shared constants (phase colors, categories)
├── services/            # API service layer
├── context/             # React context providers
└── data/                # Mock data (dev only)
```

## Rules

### 1. Component Structure
- One component per file
- Co-locate component-specific styles if needed
- Export from index.ts barrel files

### 2. DRY Principle
- Extract repeated logic into hooks (`hooks/`)
- Extract repeated UI into components (`components/ui/`)
- Extract utility functions into `lib/`

### 3. Shared Types
- All DTOs in `shared/types/`
- Backend and frontend import from same source
- Use interfaces over types where possible

### 4. No Excessive Icons
- Use icons sparingly, only where they add value
- Stick to one icon library (lucide-react)
- Max 1-2 icons per list item

### 5. No Excessive Comments
- Code should be self-documenting
- Only comment complex business logic
- No TODO comments left in code
- No commented-out code

### 6. Naming Conventions
- Components: PascalCase
- Hooks: camelCase with `use` prefix
- Files: Match export name
- Types/Interfaces: PascalCase with descriptive names

### 7. API Layer
- All API calls go through `services/`
- Hooks wrap service calls with React Query
- No direct fetch calls in components

### 8. State Management
- React Query for server state
- React Context for global UI state
- Local state for component-specific UI
