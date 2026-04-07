---
name: dynamic-domain-architecture
description: Expert in domain-driven architecture for Next.js/TypeScript projects. Enforces separation between domain services, server actions, and components. Adapts to any domain entity. Ensures proper schema validation, error handling, single responsibility principle, and route-specific component organization.
user-invocable: true
allowed-tools: All
---

# Domain Architecture & Code Organization

This skill enforces the project's domain-driven architecture and coding guidelines for building scalable, maintainable applications.

## 🤖 Dynamic Context Interpretation (AI Directives)
When applying this skill to a project, dynamically interpret the domain:
1. **Identify the `<Entity>`**: Replace `<Entity>` with the active domain model (e.g., `User`, `Order`, `Product`, `Invoice`).
2. **Identify the `<Feature>`**: Replace `<Feature>` with the active bounded context or route group (e.g., `auth`, `billing`, `inventory`).
3. **Adapt Framework APIs**: Maintain the strict separation of concerns, but adapt Next.js specific caching/routing functions to the current version of the project if necessary.

---

## Core Architecture Principles

### 1. Domain Layer (`@domain/`)

The domain layer contains pure business logic isolated from framework concerns.

#### Services (`domain/services/<entity>.service.ts`)

**Rules:**
- Services are **static classes** containing business logic methods.
- Accept schema-inferred input types (validated upstream by server actions).
- **DO NOT** perform validation inside services (validation happens in server actions).
- **DO NOT** use broad try/catch blocks.
- **ONLY** catch ORM/Database-specific errors (e.g., Prisma) to map them to standardized `ServiceError`s.
- Throw **only** standardized `ServiceError`s (custom or generic).
- Use descriptive custom error classes extending `ServiceError`.

**Structure:**
```typescript
export class <Entity>Service {
  /**
   * Create a new <Entity>.
   * Accepts a domain input (validated upstream).
   */
  static async create<Entity>(input: Create<Entity>Input): Promise<<Entity>> {
    try {
      return await db.<entity>.create({
        data: { ...input },
      });
    } catch (err) {
      throw this.mapDbError(err, "Failed to create <entity>.");
    }
  }

  // Helper to map DB/ORM errors to domain errors
  private static mapDbError(err: unknown, fallbackMessage: string): ServiceError {
    // Dynamically map ORM error codes to custom ServiceErrors
    if (isKnownDbError(err)) {
      if (err.code === "UNIQUE_CONSTRAINT") return new <Entity>ConflictError(fallbackMessage);
      if (err.code === "NOT_FOUND") return new <Entity>NotFoundError("<Entity> not found.");
      return new <Entity>PersistenceError(`${fallbackMessage} ${err.message}`);
    }
    const msg = err instanceof Error ? err.message : String(err);
    return new <Entity>PersistenceError(`${fallbackMessage} ${msg}`);
  }
}
```

#### Schemas (`domain/services/schema/<entity>.schema.ts`)

**Rules:**
- Define all input validation schemas using Zod.
- Export both schemas and inferred types.
- Include JSDoc comments explaining the purpose and constraints.
- Group related schemas together by domain entity.

**Structure:**
```typescript
import { z } from "zod";

/**
 * <Entity> input schemas & inferred types for the service layer.
 *
 * IMPORTANT:
 * - These schemas are intended to be used by the Server Action / Controller layer.
 * - Services should accept the inferred types WITHOUT re-validating.
 */

export const create<Entity>Schema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  // Add dynamic entity fields here
});

export type Create<Entity>Input = z.infer<typeof create<Entity>Schema>;

export const get<Entity>ByIdSchema = z.object({
  id: z.string().uuid(),
});

export type Get<Entity>ByIdInput = z.infer<typeof get<Entity>ByIdSchema>;
```

#### Error Classes (`domain/errors/<entity>.errors.ts`)

**Rules:**
- Base `ServiceError` class extends `Error`.
- Custom errors extend `ServiceError` with specific error codes and HTTP status codes.

**Structure:**
```typescript
export class <Entity>NotFoundError extends ServiceError {
  constructor(message: string) {
    super(message, "<ENTITY>_NOT_FOUND", 404);
    this.name = "<Entity>NotFoundError";
  }
}
```

### 2. Server Actions (`server/actions/`)

Server actions are the **interface layer** between the client and domain services. They enforce domain isolation.

#### Organization
- `server/actions/_common.ts` - Shared utilities (`validateInput`, `handleServerActionError`).
- `server/actions/<feature>/*.actions.ts` - Feature-specific actions.

#### Rules
- **ALWAYS** start with `"use server"` directive.
- Import schemas and types from `@domain/services/schema`.
- Import services from `@domain/services`.
- **Validate input** using `validateInput()` helper.
- **Handle errors** using `handleServerActionError()` helper.
- Return `ServerActionResponse<T>` for write actions.
- Use framework caching utilities (e.g., `"use cache"`, `cacheTag`, `revalidateTag`).
- Enforce authentication/authorization where needed.

**Structure - Read Actions:**
```typescript
"use server";

export async function get<Entity>s(input?: List<Entity>Input) {
  "use cache";
  cacheTag("<entity>s");
  
  const parsedInput = validateInput(list<Entity>Schema, input);
  return <Entity>Service.list<Entity>s(parsedInput);
}
```

**Structure - Write Actions:**
```typescript
"use server";

export async function create<Entity>(
  input: Create<Entity>Input,
): Promise<ServerActionResponse<Created<Entity>Payload>> {
  try {
    await requireSession(); // Enforce auth
    const parsedInput = validateInput(create<Entity>Schema, input);

    const created = await <Entity>Service.create<Entity>(parsedInput);

    updateTag("<entity>s"); // Invalidate cache
    return created;
  } catch (error) {
    return handleServerActionError(error);
  }
}
```

### 3. Route-Specific Components & Utilities

Components, hooks, and utilities that are **NOT reusable** across the app must live within their respective route directory.

#### Directory Structure
```text
app/
└── <feature-group>/
    └── <specific-route>/
        ├── _components/     # Route-specific UI components
        │   ├── <entity>-card.tsx
        │   ├── <entity>-list.tsx
        │   └── page.constants.tsx
        ├── _hooks/          # Route-specific hooks 
        ├── _utility/        # Route-specific helpers 
        └── page.tsx
```

#### Rules
- Use `_components/`, `_hooks/`, `_utility/` prefixed folders in route directories to exclude them from routing.
- Components in `_components/` are **NOT reusable** globally.
- If a component is used across multiple routes, extract it to `components/ui/` or `components/shared/`.
- Keep route-specific logic contained within route boundaries.
- Constants that are route-specific go in `_components/*.constants.tsx`.

### 4. Single Responsibility Principle

**Every function and component must have ONE clear responsibility.**

#### Rules of Thumb:
1. **Utility Functions**: Do not mix validation, formatting, database operations, and external API calls in one function.
2. **Components**: Separate data fetching (Hooks/Server Components) from rendering (UI Components) from form state management. 

✅ **GOOD - Separated concerns:**
```typescript
// 1. Hook / Data Layer
function use<Entity>() {
  // Fetching logic
}

// 2. Container Layer
export default function <Entity>Profile() {
  const { data, loading } = use<Entity>();
  if (loading) return <LoadingState />;
  return <<Entity>FormContainer data={data} />;
}

// 3. Presentation / Logic Layer
function <Entity>FormContainer({ data, onSubmit }) {
  // Form state logic
  return <<Entity>Form data={data} onSubmit={onSubmit} />;
}
```

## Implementation Checklist

When implementing a new `<Feature>` or `<Entity>`, follow this checklist:

### Domain Layer
- [ ] Create schema file in `domain/services/schema/<entity>.schema.ts`
- [ ] Define all input schemas with Zod and export inferred types
- [ ] Create custom error classes in `domain/errors/`
- [ ] Create service class in `domain/services/<entity>.service.ts`
- [ ] Implement static methods accepting schema-inferred types
- [ ] Only catch ORM errors to map to `ServiceError`s; do not validate here

### Server Actions
- [ ] Create actions file in `server/actions/<feature>/<entity>.actions.ts`
- [ ] Validate all inputs using `validateInput()`
- [ ] Handle errors using `handleServerActionError()`
- [ ] Add auth checks and cache invalidation tags
- [ ] Return standard `ServerActionResponse<T>` for mutations

### Components & UI
- [ ] Place route-specific components in `_components/` within the route directory
- [ ] Follow single responsibility: one component = one purpose
- [ ] Move generalized components to global `components/` directory

## Anti-Patterns to Avoid

❌ **DO NOT:**
- Validate in the service layer (validation is in server actions).
- Use broad `try/catch` in services (only catch DB errors).
- Put reusable components in route-level `_components/`.
- Create "god functions" that handle validation, DB calls, and formatting.
- Skip schema validation in server actions.
- Return raw ORM/Database errors to the client.
- Mix domain logic with framework-specific code (e.g., Next.js requests in Services).
