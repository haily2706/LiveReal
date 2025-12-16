# AGENTS.md

Agent coordination and responsibility definitions for LiveReal project development.

## Agent Roles & Responsibilities

### Frontend Developer Agent

**Primary Focus**: React/Next.js components, client-side logic, UI implementation

**Responsibilities**:
- Build and maintain components in `components/` and `app/` directories
- Implement client components with `'use client'` directive when needed
- Use shadcn/ui components from `components/ui/` for consistent UI
- Implement responsive layouts with Tailwind CSS v4
- Handle client-side state management (Zustand if needed)
- Use Lucide React and FontAwesome icons appropriately

**File Ownership**:
- `components/**/*.tsx` (except `components/ui/`)
- `app/(landing)/components/**/*.tsx`
- `app/(home)/components/**/*.tsx`
- Client-side TypeScript files

**Dependencies**:
- Requires UI/UX Developer for shadcn/ui components
- Requires Backend Developer for API integration
- Requires Auth Specialist for authentication flows

**Quality Gates**:
- Components must be TypeScript-strict compliant
- Use proper React 19 patterns (Server Components by default)
- Follow shadcn/ui design system conventions
- Ensure responsive design (mobile-first)

---

### Backend Developer Agent

**Primary Focus**: API routes, server actions, business logic

**Responsibilities**:
- Create and maintain API routes in `app/api/`
- Implement Server Actions in `app/actions/`
- Handle server-side logic and data validation
- Integrate with external services (Stripe, Supabase)
- Implement proper error handling and logging
- Use Drizzle ORM for database operations

**File Ownership**:
- `app/api/**/*.ts`
- `app/actions/**/*.ts`
- Server-side business logic
- `lib/utils.ts` (shared utilities)

**Dependencies**:
- Requires Database Admin for schema and queries
- Requires Auth Specialist for user verification
- Requires Payment Specialist for Stripe operations

**Quality Gates**:
- All API routes must validate input (Zod schemas)
- Proper HTTP status codes and error responses
- Authentication/authorization checks on protected routes
- Type-safe database queries using Drizzle

**Implementation Patterns**:
```typescript
// API Route Pattern
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Business logic with db operations
    return Response.json({ success: true });
}
```

---

### Database Administrator Agent

**Primary Focus**: Schema design, migrations, query optimization

**Responsibilities**:
- Design and maintain database schema in `lib/db/schema.ts`
- Generate and manage migrations with Drizzle Kit
- Optimize database queries and indexes
- Handle database connection configuration
- Ensure data integrity and relationships

**File Ownership**:
- `lib/db/schema.ts`
- `lib/db/index.ts`
- `drizzle.config.ts`
- `drizzle/` migration files

**Dependencies**:
- Collaborates with Backend Developer on query patterns
- Coordinates with Payment Specialist on subscription schema
- Works with Auth Specialist on user data requirements

**Quality Gates**:
- All schema changes require migration files
- Foreign key relationships properly defined
- Indexes created for query performance
- Type-safe schema exports for Drizzle

**Workflow**:
1. Modify `lib/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Review migration SQL in `drizzle/` folder
4. Run `npm run db:migrate` or `npm run db:push`
5. Verify changes in Drizzle Studio (`npm run db:studio`)

---

### Authentication Specialist Agent

**Primary Focus**: Supabase authentication, authorization, user management

**Responsibilities**:
- Implement authentication flows (sign up, sign in, sign out)
- Manage Supabase client instances (server, client, admin)
- Handle role-based access control (ADMIN, MANAGER, USER)
- Maintain middleware for route protection
- Implement session management

**File Ownership**:
- `lib/supabase/**/*.ts`
- `app/api/auth/**/*.ts`
- Authentication-related middleware

**Dependencies**:
- Works with Backend Developer on protected routes
- Coordinates with Frontend Developer on auth UI
- Supports Database Admin on user data schema

**Quality Gates**:
- Proper client selection (server vs client vs admin)
- Role checks on protected routes
- Cookie handling in Server Components
- Middleware protection configured correctly

**Key Patterns**:
```typescript
// Server Component
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Client Component
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Admin operations
import { createClient } from '@/lib/supabase/admin';
const supabase = createClient();
```

**Protected Route Pattern**:
- Dashboard routes (`/dashboard/*`) require ADMIN or MANAGER role
- Middleware in `lib/supabase/middleware.ts` handles automatic redirects

---

### Payment Integration Specialist Agent

**Primary Focus**: Stripe integration, subscription management, billing

**Responsibilities**:
- Implement Stripe checkout flows
- Handle webhook events and synchronization
- Manage customer portal integration
- Sync subscription data to database
- Handle payment-related business logic

**File Ownership**:
- `lib/stripe.ts`
- `app/api/payments/**/*.ts`
- Subscription-related database operations

**Dependencies**:
- Requires Database Admin for subscription schema
- Works with Backend Developer on payment APIs
- Coordinates with Auth Specialist on user-subscription linking

**Quality Gates**:
- Webhook signature verification required
- Idempotent webhook handling (prevent duplicate processing)
- Proper metadata extraction (userId, planId)
- Database sync on all relevant Stripe events

**Stripe Events Handled**:
- `checkout.session.completed`: Create subscription record
- `invoice.payment_succeeded`: Update subscription details
- `customer.subscription.updated`: Update subscription status
- `customer.subscription.deleted`: Handle cancellation

**Implementation Note**:
- Stripe API version: `2025-11-17.clover`
- Always verify webhook signatures
- Use metadata for user/plan linking

---

### UI/UX Developer Agent

**Primary Focus**: Design system, shadcn/ui components, styling, user experience

**Responsibilities**:
- Maintain shadcn/ui component library in `components/ui/`
- Ensure consistent design system usage
- Implement Tailwind CSS styling
- Create accessible, responsive interfaces
- Manage theme configuration and CSS variables

**File Ownership**:
- `components/ui/**/*.tsx`
- `app/globals.css`
- `components.json`
- `tailwind.config.ts`

**Dependencies**:
- Provides components to Frontend Developer
- Coordinates with Frontend on design patterns

**Quality Gates**:
- shadcn/ui New York variant compliance
- Accessibility standards (ARIA, keyboard navigation)
- Responsive design (mobile, tablet, desktop)
- Dark mode support where applicable
- Consistent use of zinc color palette

**Configuration**:
- Style: New York
- Base color: zinc
- CSS variables: enabled
- Icon library: Lucide React
- Font: Default system fonts

---

### DevOps Agent

**Primary Focus**: Deployment, environment configuration, CI/CD

**Responsibilities**:
- Manage environment variables across environments
- Configure deployment pipelines
- Monitor application performance
- Handle database migrations in production
- Manage secrets and API keys

**File Ownership**:
- `.env` (local only, never commit)
- `next.config.js`
- `vercel.json`
- CI/CD configuration files

**Environment Variables Checklist**:
```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (required)
DATABASE_URL=

# Stripe (required)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

**Quality Gates**:
- All environment variables documented
- Secrets never committed to repository
- Database migrations run before deployment
- Build passes locally before deployment

---

### Testing Agent

**Primary Focus**: Quality assurance, testing, bug verification

**Responsibilities**:
- Write and maintain test suites
- Verify bug fixes and new features
- Perform integration testing
- Validate API responses and error handling
- Test authentication and authorization flows

**Dependencies**:
- Works with all agents to verify their implementations
- Coordinates with Backend on API testing
- Validates Frontend component behavior

**Quality Gates**:
- API routes return correct status codes
- Error handling tested for edge cases
- Authentication flows work as expected
- Database operations are transactional where needed
- Stripe webhooks process correctly

**Testing Checklist**:
- [ ] Build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Database migrations apply cleanly
- [ ] Authentication flows functional
- [ ] Stripe webhooks process test events
- [ ] Protected routes enforce authorization
- [ ] TypeScript strict mode compliance

---

## Agent Coordination Protocols

### Communication Flow

1. **Feature Implementation**:
   - Frontend Developer ↔ Backend Developer: API contract definition
   - Backend Developer ↔ Database Admin: Schema requirements
   - Backend Developer ↔ Auth Specialist: Authorization rules
   - Backend Developer ↔ Payment Specialist: Payment flows

2. **Schema Changes**:
   - Database Admin creates schema → Backend Developer updates queries → Frontend Developer updates UI

3. **Authentication Changes**:
   - Auth Specialist updates middleware → Backend Developer updates route protection → Frontend Developer updates UI flows

### Handoff Procedures

**Database Schema Changes**:
1. Database Admin: Define schema in `lib/db/schema.ts`
2. Database Admin: Generate and test migration
3. Database Admin → Backend Developer: Notify of schema changes
4. Backend Developer: Update queries and types
5. Backend Developer → Frontend Developer: Update API contracts
6. Testing Agent: Verify end-to-end flow

**API Development**:
1. Backend Developer: Implement API route
2. Backend Developer → Testing Agent: Provide API documentation
3. Testing Agent: Verify API behavior
4. Backend Developer → Frontend Developer: Provide API contract
5. Frontend Developer: Integrate with UI
6. Testing Agent: Verify integration

**Payment Integration**:
1. Payment Specialist: Implement Stripe logic
2. Payment Specialist → Database Admin: Define subscription schema
3. Payment Specialist: Configure webhooks
4. Payment Specialist → Testing Agent: Provide test events
5. Testing Agent: Verify webhook processing
6. Frontend Developer: Implement checkout UI

### Conflict Resolution

**File Ownership Conflicts**:
- Each agent owns specific file patterns
- Shared files (e.g., `lib/utils.ts`) require coordination
- Always communicate before modifying another agent's files

**Schema Conflicts**:
- Database Admin has final authority on schema design
- Backend Developer can propose changes
- Changes require migration files (no direct DB edits)

**API Contract Changes**:
- Backend Developer owns API contracts
- Frontend Developer must be notified of breaking changes
- Versioning strategy: Add new endpoints, deprecate old ones

### Quality Assurance Checkpoints

**Pre-Implementation**:
- [ ] Requirements clearly defined
- [ ] Agent responsibilities assigned
- [ ] Dependencies identified
- [ ] Timeline established

**During Implementation**:
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling
- [ ] Authentication/authorization checks
- [ ] Database transactions where needed

**Post-Implementation**:
- [ ] Code review completed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Deployment checklist verified

---

## Project-Specific Guidelines

### Next.js 16 + React 19 Patterns

**Server Components** (default):
- No `'use client'` directive
- Can use async/await directly
- Access server-side resources (database, APIs)

**Client Components**:
- Require `'use client'` directive
- Use hooks (useState, useEffect, etc.)
- Handle user interactions

**Server Actions** (preferred for mutations):
- Define in `app/actions/`
- Use `'use server'` directive
- Type-safe form handling

### Database Query Patterns

**Always use Drizzle ORM**:
```typescript
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Type-safe queries
const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt));
```

### Authentication Patterns

**Route Protection**:
- Middleware handles dashboard routes automatically
- API routes must check auth manually
- Use appropriate Supabase client for context

### Stripe Integration Patterns

**Webhook Security**:
- Always verify signatures
- Use try-catch for constructEvent
- Return 400 on signature failure
- Extract metadata safely (check existence)

**Idempotency**:
- Use Stripe event IDs to prevent duplicate processing
- Consider database transactions for complex operations

---

## Emergency Procedures

### Database Issues
1. Check connection string in `.env`
2. Verify local Supabase hostname handling in `lib/db/index.ts`
3. Run `npm run db:studio` to inspect data
4. Rollback migration if needed

### Authentication Issues
1. Verify Supabase environment variables
2. Check middleware configuration
3. Test with different user roles
4. Review cookie handling in server client

### Stripe Webhook Failures
1. Verify webhook secret matches Stripe dashboard
2. Check signature verification code
3. Test with Stripe CLI (`stripe listen --forward-to`)
4. Review webhook event logs in Stripe dashboard

### Build Failures
1. Run `npm run lint` to check for errors
2. Verify all imports resolve correctly
3. Check TypeScript configuration
4. Clear `.next` folder and rebuild

---

## Success Criteria

**Agent Collaboration Success**:
- No file ownership conflicts
- Clear communication on dependencies
- Timely handoffs between agents
- Quality gates passed before handoff

**Code Quality Success**:
- TypeScript strict mode compliance
- No ESLint errors
- Build succeeds without warnings
- All environment variables documented

**Feature Completeness**:
- Frontend, backend, database aligned
- Authentication/authorization working
- Error handling comprehensive
- Tests passing

**Deployment Readiness**:
- Environment variables configured
- Database migrations ready
- Build artifacts optimized
- Secrets secured
