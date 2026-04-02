---
name: domain-architecture
description: Expert in this project's domain-driven architecture. Enforces separation between domain services, server actions, and components. Ensures proper schema validation, error handling, single responsibility principle, and route-specific component organization (_components/, _hooks/, _utility/).
user-invocable: true
allowed-tools: All
---

# Domain Architecture & Code Organization

This skill enforces the project's domain-driven architecture and coding guidelines for building scalable, maintainable applications.

## Core Architecture Principles

### 1. Domain Layer (`@domain\`)

The domain layer contains pure business logic isolated from framework concerns.

#### Services (`domain/services/*.service.ts`)

**Rules:**

- Services are **static classes** containing business logic methods
- Accept schema-inferred input types (validated upstream by server actions)
- **DO NOT** perform validation inside services (validation happens in server actions)
- **DO NOT** use broad try/catch blocks
- **ONLY** catch Prisma-specific errors to map them to standardized ServiceErrors
- Throw **only** standardized ServiceErrors (custom or generic)
- Use descriptive custom error classes extending ServiceError

**Structure:**

```typescript
export class CourseService {
  /**
   * Create a new Course.
   * Accepts a domain input (validated upstream).
   */
  static async createCourse(input: CreateCourseInput): Promise<Course> {
    try {
      return await prisma.course.create({
        data: {
          title: input.title,
          description: input.description,
        },
      });
    } catch (err) {
      throw this.mapPrismaError(err, "Failed to create course.");
    }
  }

  // Helper to map Prisma errors to domain errors
  private static mapPrismaError(
    err: unknown,
    fallbackMessage: string,
  ): ServiceError {
    // Map specific Prisma error codes to custom ServiceErrors
    if (isKnownRequestError(err)) {
      if (err.code === "P2002") return new CourseConflictError(fallbackMessage);
      if (err.code === "P2025")
        return new CourseNotFoundError("Course not found.");
      return new CoursePersistenceError(`${fallbackMessage} ${err.message}`);
    }
    // Fallback for unknown errors
    const msg = err instanceof Error ? err.message : String(err);
    return new CoursePersistenceError(`${fallbackMessage} ${msg}`);
  }
}
```

**Custom Error Classes:**

```typescript
export class CourseNotFoundError extends ServiceError {
  constructor(message: string) {
    super(message, "COURSE_NOT_FOUND", 404);
    this.name = "CourseNotFoundError";
  }
}

export class CourseConflictError extends ServiceError {
  constructor(message: string) {
    super(message, "COURSE_CONFLICT", 409);
    this.name = "CourseConflictError";
  }
}

export class CoursePersistenceError extends ServiceError {
  constructor(message: string) {
    super(message, "COURSE_PERSISTENCE_ERROR", 500);
    this.name = "CoursePersistenceError";
  }
}
```

#### Schemas (`domain/services/schema/*.schema.ts`)

**Rules:**

- Define all input validation schemas using Zod
- Export both schemas and inferred types
- Include JSDoc comments explaining the purpose and constraints
- Group related schemas together by domain entity

**Structure:**

```typescript
import { z } from "zod";

/**
 * Course input schemas & inferred types for the service layer.
 *
 * IMPORTANT:
 * - These schemas are intended to be used by the Server Action / Controller layer.
 * - Services should accept the inferred types WITHOUT re-validating.
 */

export const createCourseSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const getCourseByIdSchema = z.object({
  id: z.string().uuid(),
});

export type GetCourseByIdInput = z.infer<typeof getCourseByIdSchema>;

export const updateCourseSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().trim().min(1, "Title is required").optional(),
    description: z.string().trim().min(1, "Description is required").optional(),
  })
  .refine((v) => v.title !== undefined || v.description !== undefined, {
    message: "At least one field must be provided to update",
    path: ["title"],
  });

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
```

#### Error Classes (`domain/errors/*.ts`)

**Rules:**

- Base ServiceError class extends Error
- Custom errors extend ServiceError with specific error codes and HTTP status codes
- Include errorCode and errorStatus properties

**Base Error:**

```typescript
export class ServiceError extends Error {
  public errorCode: string;
  public errorStatus: number;

  constructor(message: string, errorCode?: string, errorStatus?: number) {
    super(message);
    this.name = "ServiceError";
    this.errorCode = errorCode ?? "SERVICE_ERROR";
    this.errorStatus = errorStatus ?? 500;
  }
}
```

### 2. Server Actions (`server/actions/`)

Server actions are the **interface layer** between the client and domain services. They enforce domain isolation.

#### Organization

- `server/actions/_common.ts` - Shared utilities (validateInput, handleServerActionError)
- `server/actions/<feature>/*.actions.ts` - Feature-specific actions
- `server/actions/auth.ts` - Authentication actions

#### Rules

- **ALWAYS** start with `"use server"` directive
- Import schemas and types from `@domain/services/schema`
- Import services from `@domain/services`
- **Validate input** using `validateInput()` helper
- **Handle errors** using `handleServerActionError()` helper
- Return `ServerActionResponse<T>` for write actions
- Use Next.js cache utilities (`"use cache"`, `cacheTag`, `cacheLife`, `updateTag`)
- Enforce authentication where needed using `getSessionThrowable()`

**Structure - Read Actions:**

```typescript
export async function getCourses(input?: ListCoursesInput) {
  "use cache";
  cacheTag("courses");
  cacheLife("hours");

  const parsedInput = validateInput(listCoursesSchema, input);
  return CourseService.listCourses(parsedInput);
}

export async function getCourseById(input: GetCourseByIdInput) {
  "use cache";
  cacheTag("courseById", input.id);
  cacheLife("hours");

  const parsedInput = validateInput(getCourseByIdSchema, input);
  return CourseService.getCourseById(parsedInput);
}
```

**Structure - Write Actions:**

```typescript
export async function createCourse(
  input: CreateCourseInput,
): Promise<ServerActionResponse<CreatedCoursePayload>> {
  try {
    await getSessionThrowable(true); // Enforce auth
    const parsedInput = validateInput(createCourseSchema, input);

    const created = await CourseService.createCourse(parsedInput);

    updateTag("courses"); // Invalidate cache
    return {
      id: created.id,
      title: created.title,
      description: created.description ?? "",
      isArchived: created.isArchived,
    };
  } catch (error) {
    return handleServerActionError(error);
  }
}

export async function updateCourse(
  input: UpdateCourseInput,
): Promise<ServerActionResponse<void>> {
  try {
    await getSessionThrowable(true);
    const parsedInput = validateInput(updateCourseSchema, input);

    await CourseService.updateCourse(parsedInput);

    // Invalidate all related caches
    updateTag("courses");
    updateTag("courseById");
    updateTag("courseHierarchy");
    updateTag(parsedInput.id);
  } catch (error) {
    return handleServerActionError(error);
  }
}
```

**Common Utilities (`_common.ts`):**

```typescript
export function validateInput<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): z.infer<T> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues);
  }

  return parsed.data;
}

export function handleServerActionError(
  error: unknown,
): ServerActionErrorResponse {
  if (error instanceof ValidationError) {
    console.log("Validation error:", error.issues);
    return { error: error.message, code: error.code };
  }

  if (error instanceof ServerActionError) {
    console.log("Server action error:", error.message);
    return { error: error.message, code: error.code };
  }

  if (error instanceof ServiceError) {
    console.log("Service error:", error.message);
    return { error: error.message, code: error.errorCode };
  }

  console.error("Unhandled server action error:", error);
  return { error: "Internal Server Error", code: "INTERNAL_SERVER_ERROR" };
}

export type ServerActionResponse<T> =
  | T
  | ServerActionErrorResponse
  | ServerActionValidationErrorResponse;
```

### 3. Route-Specific Components & Utilities

Components, hooks, and utilities that are **NOT reusable** across the app should live within their route directory.

#### Directory Structure

```
app/
└── learning-center/
    └── dashboard/
        ├── _components/     # Dashboard-specific components
        │   ├── sidebar.tsx
        │   ├── sidebar.constants.tsx
        │   └── user-avatar.tsx
        ├── _hooks/          # Dashboard-specific hooks (if needed)
        └── _utility/        # Dashboard-specific utilities (if needed)
        └── admin/
            └── courses/
                ├── _components/     # Course management components
                │   ├── course-card.tsx
                │   ├── course-list.tsx
                │   └── create-course-form.tsx
                └── [id]/
                    ├── _components/     # Single course page components
                    │   ├── edit-course-form.tsx
                    │   ├── danger-zone.tsx
                    │   └── chapter-row.tsx
                    └── page.tsx
```

#### Rules

- Use `_components/`, `_hooks/`, `_utility/` prefixed folders in route directories
- Components in `_components/` are **NOT reusable** globally
- If a component is used across multiple routes, move it to `components/ui/` or `components/shared/`
- Keep route-specific logic contained within route boundaries
- Constants that are route-specific go in `_components/*.constants.tsx`

**Example - Route-Specific Component:**

```typescript
// app/learning-center/dashboard/_components/sidebar.tsx
"use client";

import Link from "next/link";
import { getDashboardRoutes } from "./sidebar.constants";
import { usePathname } from "next/navigation";

function SidebarMenu({ href, label }: DashboardRoute) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={cn(
        "w-full px-6 py-3 hover:bg-muted rounded-md block text-lg",
        pathname === href && "bg-primary text-primary-foreground"
      )}
    >
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex flex-col gap-1">
      {getDashboardRoutes(session?.user?.role === "admin").map((route) => (
        <SidebarMenu key={route.href} {...route} />
      ))}
    </div>
  );
}
```

### 4. Single Responsibility Principle

**Every function must have ONE clear responsibility.**

#### Utility Functions

❌ **BAD - Multiple responsibilities:**

```typescript
function processUserData(user: User) {
  // Validation
  if (!user.email) throw new Error("Invalid email");

  // Formatting
  const formatted = {
    name: user.name.toUpperCase(),
    email: user.email.toLowerCase(),
  };

  // Database operation
  await db.user.update({ where: { id: user.id }, data: formatted });

  // Sending email
  await sendWelcomeEmail(user.email);
}
```

✅ **GOOD - Single responsibility per function:**

```typescript
function validateUserEmail(email: string): void {
  if (!email) throw new Error("Invalid email");
}

function formatUserData(user: User) {
  return {
    name: user.name.toUpperCase(),
    email: user.email.toLowerCase(),
  };
}

async function updateUserInDatabase(userId: string, data: Partial<User>) {
  return db.user.update({ where: { id: userId }, data });
}

async function sendWelcomeEmail(email: string) {
  // Email sending logic
}
```

#### Component Functions

❌ **BAD - Component doing too much:**

```typescript
export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (values) => {
    const validated = validateUserData(values);
    const formatted = formatUserData(validated);
    await updateUser(formatted);
    setUser(formatted);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <UserAvatar user={user} />
      <UserForm user={user} onSubmit={handleUpdate} />
    </div>
  );
}
```

✅ **GOOD - Separated concerns:**

```typescript
// Custom hook for user data fetching
function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser().then(data => {
      setUser(data);
      setLoading(false);
    });
  }, []);

  return { user, loading, setUser };
}

// Component only handles rendering
export default function UserProfile() {
  const { user, loading } = useUser();

  if (loading) return <LoadingState />;

  return (
    <div>
      <UserAvatar user={user} />
      <UserFormContainer user={user} />
    </div>
  );
}

// Separate component for form logic
function UserFormContainer({ 
  user, 
  onSubmit 
}: {
  user: User, 
  onSubmit: (UserFormValues) => void,
  // Other callbacks
}) {

  return <UserForm user={user} onSubmit={onSubmit} />;
}
```

## Implementation Checklist

When implementing a new feature, follow this checklist:

### Domain Layer

- [ ] Create schema file in `domain/services/schema/<entity>.schema.ts`
- [ ] Define all input schemas with Zod
- [ ] Export schema types
- [ ] Create custom error classes in `domain/errors/`
- [ ] Create service class in `domain/services/<entity>.service.ts`
- [ ] Implement static methods accepting schema-inferred types
- [ ] Only catch Prisma errors to map to ServiceErrors
- [ ] Never validate inside services (validation is upstream)

### Server Actions

- [ ] Create actions file in `server/actions/<feature>/<entity>.actions.ts`
- [ ] Add `"use server"` directive at the top
- [ ] Import schemas and services from domain layer
- [ ] Validate all inputs using `validateInput()`
- [ ] Handle errors using `handleServerActionError()`
- [ ] Add authentication checks where needed
- [ ] Add cache tags and invalidation for read/write actions
- [ ] Return `ServerActionResponse<T>` for write operations

### Components & UI

- [ ] Place route-specific components in `_components/` within route directory
- [ ] Use `"use client"` directive for client components
- [ ] Follow single responsibility: one component = one purpose
- [ ] Extract custom hooks to `_hooks/` if route-specific
- [ ] Extract utilities to `_utility/` if route-specific
- [ ] Move to global `components/` or `hooks/` or `lib/` if reusable

### Code Quality

- [ ] Every function has ONE clear responsibility
- [ ] No god functions that do multiple things
- [ ] Proper error handling at each layer
- [ ] Descriptive variable and function names
- [ ] JSDoc comments for public APIs
- [ ] Type safety throughout (no `any` unless absolutely necessary)

## Common Patterns

### Pattern 1: CRUD Operations

1. **Schema** (`domain/services/schema/entity.schema.ts`)
2. **Service** (`domain/services/entity.service.ts`)
3. **Actions** (`server/actions/<feature>/entity.actions.ts`)
4. **Form Component** (`app/<route>/_components/entity-form.tsx`)
5. **List Component** (`app/<route>/_components/entity-list.tsx`)

### Pattern 2: Data Fetching

1. **Read Action** with `"use cache"` and cache tags
2. **Component** calls the action directly
3. **Loading State** using Suspense or conditional rendering

### Pattern 3: Form Submission

1. **Client Form** validates using `@tanstack/react-form` or similar
2. **Calls Server Action** with validated data
3. **Server Action** validates again with Zod schema
4. **Service** performs business logic
5. **Cache Invalidation** using `updateTag()`
6. **Error Handling** returns user-friendly errors

## Anti-Patterns to Avoid

❌ **DO NOT:**

- Validate in service layer (validation is in server actions)
- Use broad try/catch in services (only catch Prisma errors)
- Put reusable components in `_components/`
- Create god functions that do multiple things
- Skip schema validation in server actions
- Return raw Prisma errors to the client
- Mix domain logic with framework-specific code
- Use generic ServiceError for everything (create custom errors)

✅ **DO:**

- Validate in server actions using schemas
- Map Prisma errors to custom ServiceErrors
- Keep route-specific code in route directories
- Follow single responsibility principle
- Always validate server action inputs
- Return standardized error responses
- Separate domain logic from infrastructure
- Create descriptive custom error classes

## Examples

See these files for reference implementations:

- `domain/services/course.service.ts` - Complete service example
- `domain/services/schema/course.schema.ts` - Schema definitions
- `server/actions/learning-center/course.actions.ts` - Server actions
- `app/learning-center/dashboard/_components/` - Route-specific components
- `domain/errors/ServiceError.ts` - Base error class

## Workflow

When asked to implement a feature following this architecture:

1. **Analyze Requirements** - Understand the domain entity and operations
2. **Create Schema** - Define validation schemas in domain layer
3. **Create Service** - Implement business logic with error handling
4. **Create Actions** - Build server action interface with validation
5. **Create Components** - Build UI in appropriate route directory
6. **Test** - Verify error handling and validation at each layer
7. **Review** - Ensure single responsibility and proper separation

Always maintain clear boundaries between layers and follow the single responsibility principle at all levels.
