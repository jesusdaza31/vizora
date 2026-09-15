## Objective

This project must be developed as a **Modular Monolith** using a **PNPM Workspaces Monorepo**.

The architecture must prioritize:
- Scalability
- Low coupling
- High cohesion
- Reusability
- Evolution without breaking compatibility
- Clear separation of responsibilities

The architecture is the highest authority in the project.
No implementation can violate it.
Every new feature must conform to the existing architecture.

# Technology Stack

## Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Base UI

## Backend
- Express
- TypeScript
- tsyringe (Dependency Injection)
- neverthrow (Result-based error handling)

## Monorepo
- PNPM Workspaces

# Monorepo Organization

```
apps/
    frontend/
    backend/

packages/
    config/
    database/
    types/
```

## apps — executable applications (frontend, backend)
## packages — reusable libraries (all shared code)

# Modular Monolith

```
modules/
  datasources/
  dashboards/
  components/
  filters/
```

Each module must:
- Encapsulate its domain
- Have a single responsibility
- Remain independent of other modules

# Frontend Project Structure

A single Next.js app (port 3080) that reflects the backend modular monolith.

```
apps/frontend/
├── app/
│   ├── layout.tsx          # GENERIC: html/body, Inter, globals.css
│   ├── page.tsx            # Landing / dashboard list
│   └── dashboards/
│       ├── page.tsx        # Dashboard list
│       └── [id]/
│           └── page.tsx    # Dashboard viewer/editor
├── components/
│   ├── ui/                 # Shared generic UI components
│   ├── dashboard/          # Dashboard builder components
│   └── charts/             # Chart components
└── lib/
    ├── utils.ts            # cn() helper
    └── api/                # API client
```

# Communication between Modules
Only through: Interfaces, Contracts, Use cases, DTOs.
Never through concrete implementations.

# Dependencies
Always target abstractions (Dependency Inversion Principle).

# External Libraries
Always introduce an adapter. The domain never depends on external libraries.

# Responsibilities
Each module owns: its business logic, its entities, its use cases.

# Evolution
Implementations must be replaceable without modifying the domain.

# Compatibility
Every new implementation must preserve the existing architecture.
Never break public contracts. Never introduce circular dependencies.
