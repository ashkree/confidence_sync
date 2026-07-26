# ConfidenceSync — Remaining Frontend Work

> **Reuse-first directive:** Before writing anything new, check for an existing pattern in the codebase and follow it. This repo already has consistent conventions for API clients, routing, forms, and UI composition — new code should look like it was written by the same person who wrote the rest of it, not bolted on.

> **Updated:** this revision cross-checks the plan against the current state of the repo. Status legend: ✅ Done · 🚧 Partial / needs rework · ❌ Not started.

---

## 0. Ground rules (apply to every task below)

- **API client pattern**: Follow `frontend/src/api/auth/` exactly — a `*.mock.ts`, a `*.service.ts`, and an `index.ts` that switches between them via `import.meta.env.VITE_USE_MOCK`. Do this for `tickets` ✅, `documents` ❌, and `ai` ❌.
- **Types**: Add new types under `frontend/src/types/` (mirror `user.ts` / `auth.ts`) and re-export from `frontend/src/types/index.ts`. ✅ done for tickets (`types/tickets/{ticket,hr_request,it_ticket}.ts`); still needed for `documents` and `ai` (chat session/messages).
- **Routing**: Use `createFileRoute` file-based routes exactly as in `frontend/src/routes/_authenticated/*`. Guarded routes use `beforeLoad` + `context.auth.hasRole` / `hasDepartment` + `redirect` to `/unauthorized`, matching `admin/route.tsx`, `admin/hr/route.tsx`, `admin/it/route.tsx`. ✅ pattern established and correctly reused.
- **Forms**: Use `@tanstack/react-form` + `zod` schema + the `Field` / `FieldLabel` / `FieldError` components, exactly as in `routes/login.tsx`. ✅ pattern exists in `login.tsx`, but 🚧 not yet applied to `TicketSubmissionPage.tsx` (still plain `useState`/uncontrolled form).
- **UI composition**: Build pages out of the existing shadcn-style primitives in `components/ui/*`. ✅ The primitive library is now essentially complete — `Card`, `Field`, `Select`, `Popover`, `Calendar`, `Table`/`DataTable`, `Sheet`, `DropdownMenu`, `Badge`, `Button`, `Tooltip`, `Avatar`, `Breadcrumb`, `Collapsible`, `Label`, `Textarea`, `Skeleton`, `Separator` all exist. No new component library needed.
- **Page structure**: Follow `HeroSection` + `container mx-auto p-6` pattern used in `ProfilePage.tsx` / `KnowledgeBasePage.tsx` for consistency across all new pages.
- **Auth/permissions**: Use `useAuth()` and `usePermissions()` / `<PermissionGuard>` for any conditional rendering — don't re-implement role checks inline. ✅ `PermissionGuard`, `usePermissions`, route-level `beforeLoad` guards all exist and are used consistently in routes; not yet used inside `ProfilePage.tsx`, which still calls a mock hook instead of `useAuth()`.

---

## 1. API layer

| Client to build | Status | Mirrors | Endpoints (from API design doc) |
|---|---|---|---|
| `api/tickets/` | ✅ **Done** — `tickets.mock.ts`, `tickets.service.ts`, `index.ts` all exist and follow the `api/auth` pattern exactly, with seeded `HrRequest`/`ItTicket` mock data. | `api/auth/` | `POST /tickets`, `GET /tickets`, `GET /tickets/{id}`, `PATCH /tickets/{id}/status`, `POST /tickets/{id}/comments`, `GET /tickets/{id}/comments` |
| `api/documents/` | ❌ Not started | `api/auth/` | `POST /documents`, `GET /documents`, `GET /documents/{id}`, `DELETE /documents/{id}` |
| `api/ai/` | ❌ Not started | `api/auth/` | `POST /ai/chat`, `GET /ai/session/{id}`, `POST /ai/session/` |

**Gap in the existing `tickets` client:** `fetchTickets`/`fetchTicket` cover list + single-ticket read, but there are no client functions yet for `PATCH /tickets/{id}/status`, `POST /tickets/{id}/comments`, or `GET /tickets/{id}/comments`. These will be needed for §4 (Ticket Detail Page) and §5 (Kanban status changes) — add them to `tickets.mock.ts` / `tickets.service.ts` / `index.ts` following the same pattern rather than creating a separate module.

For `documents` and `ai`: write a realistic `.mock.ts` (seed data similar to `auth.mock.ts`'s `MOCK_USERS` shape) so pages can be built and demoed before the backend is ready.

---

## 2. Wire up the ticket submission form

**File:** `components/page/TicketSubmissionPage.tsx` — **Status: 🚧 Not done, unchanged from last review.**

- Still stubs submission with `console.log("Form submitted")` instead of calling `api/tickets`.
- Still plain `useState` + uncontrolled `<form onSubmit>` — needs converting to `@tanstack/react-form` + `zod`, matching `login.tsx`'s pattern.
- On success, navigate to the ticket detail page (see §4) using `useNavigate` as in `app-sidebar.tsx`.
- Now that `api/tickets` exists (§1), this is unblocked and should be picked up next.

---

## 3. Employee Dashboard — replace placeholders with real data

**Files:** `components/sections/PendingRequestsSection.tsx`, `components/sections/TopicsSection.tsx` — **Status: ❌ Not started, both still render `aspect-video bg-muted/50` placeholder divs.**

- `PendingRequestsSection`: fetch the current user's tickets via `api/tickets` (now available) and render as `Card` items instead of placeholders. Reuse `Badge` for status (Open/Pending/Resolved/Closed) — note `getStatusColor`/`getPriorityColor` helpers already exist in `ticket-table.tsx` and can be extracted/reused here instead of re-implemented.
- `TopicsSection`: either wire to the knowledge base document list (§6) or deprioritize — confirm with product owner if this is still in scope for MVP.

---

## 4. Ticket / Request Detail Page — **still missing entirely**

**Status: ❌ Not started.** No `$ticketId.tsx` route and no `TicketDetailPage.tsx` component exist yet (confirmed via `routeTree.gen.ts` — no ticket detail route is registered). This remains the biggest gap relative to MVP success criteria (AI summary + comments) and demo script steps 4–6.

- New route: `routes/_authenticated/ticket/$ticketId.tsx` (file-based, same convention as `ticket/submit.tsx`).
- New component: `components/page/TicketDetailPage.tsx`.
- Use `Card` for layout, `Badge` for status (reuse the color-mapping helpers from `ticket-table.tsx`), `Table` or a simple list for the comment thread, `Textarea` + `Button` for adding a comment (same primitives as `TicketSubmissionPage.tsx`).
- Per the footnote in the plan: **the same component must render differently for employee vs. admin** — reuse `usePermissions()`/`useAuth()` to conditionally show the status-change control (`Select` bound to `PATCH /tickets/{id}/status`) only for admins.
- Show the AI-generated summary (`ticket.information` field) — render `null`/loading state gracefully since it's nullable until the AI finishes.
- Needs the comment/status endpoints added to `api/tickets` first (see gap noted in §1).

---

## 5. HR & IT Admin Dashboards — **partially started, needs rework toward Kanban**

**Files:** `routes/_authenticated/admin/hr/route.tsx`, `routes/_authenticated/admin/it/route.tsx`, plus new: `routes/_authenticated/admin/it/tickets.tsx`, `components/ticket-table.tsx`, `components/ui/data-table.tsx`.

**Status: 🚧 IT side has a working list view; HR side has nothing beyond the route guard; neither is the Kanban board the plan specifies.**

- `admin/it/tickets.tsx` now exists and renders a real (mock-data-backed) table via the new generic `TicketTable`/`DataTable` components, with summary stat cards (unassigned/open/pending counts) above it. This is good, reusable work — but it's a flat table, not the four-column Kanban (Open → Pending → Resolved → Closed) the plan and demo script call for, and its route is `admin/it/tickets` rather than an `admin/it/index.tsx` landing page.
- `admin/hr/route.tsx` still only guards and renders `<Outlet />` — there is no `admin/hr/index.tsx` or equivalent HR requests page at all yet.
- Decision needed before continuing: either (a) build the shared `components/page/AdminKanbanBoard.tsx` parameterized by `department: "hr" | "it"` as originally planned and treat `ticket-table.tsx` as a component to keep for a "table view" toggle, or (b) confirm a table view satisfies the MVP demo requirement ("move a ticket through all four status stages") and skip Kanban entirely, reusing `ticket-table.tsx` for both departments instead of building a new Kanban component.
- Whichever direction is chosen, the HR side needs the same treatment IT already has: an `admin/hr/index.tsx` (or `requests.tsx`) route, HR-specific columns (mirroring how `admin/it/tickets.tsx` adds an `Issue Type` column via `createColumnHelper<ItTicket>()`), and a page using `TicketTable<HrRequest>`.
- Each card/row should link to the Ticket Detail Page (§4), which doesn't exist yet — this is a hard dependency.
- Status changes: given the table view already exists, the simplest path (as originally suggested) is to keep status changes on the Ticket Detail Page via the existing `Select` pattern rather than building drag-and-drop, which still doesn't exist anywhere in `components/ui`.

---

## 6. Knowledge Base — connect to real data

**File:** `components/page/KnowledgeBasePage.tsx` — **Status: ❌ Not started, unchanged.** Still uses hardcoded `hrPolicies` / `itManuals` arrays and `e.preventDefault()` stub links.

- Replace the hardcoded arrays with a fetch from `api/documents` (§1, not yet built), filtered by `department`.
- Remove the `e.preventDefault()` stub — link to actual document (S3 URL) or a document viewer route once available.

---

## 7. HR Policies / IT Manuals Management Dashboards — **still missing entirely**

**Status: ❌ Not started.** Two admin-only pages, blocked on `api/documents` (§1).

- New routes under `admin/hr/policies.tsx` and `admin/it/manuals.tsx` (or similar), guarded the same way as the existing `admin/hr` and `admin/it` routes.
- Reuse `Table` (or the new `DataTable`, which is now a better fit given `ticket-table.tsx` establishes the pattern) for the document list (version, last-updated columns per the spec), `Sheet` (already used for the mobile sidebar, and reusable here as-is via `side="right"`) for an "Upload Document" side panel, and a destructive `Button`/`DropdownMenuItem` (`variant="destructive"`) for delete.
- Wire to `api/documents` (§1).

---

## 8. AI Assistant Chat Widget — **still missing entirely**

**Status: ❌ Not started.** No `AiChat` component directory, no `api/ai` client.

- New component: `components/AiChat/ChatWidget.tsx` (or similar), likely mounted globally in `routes/_authenticated/route.tsx` alongside `SidebarProvider`.
- Floating trigger button (reuse `Button` `variant="default"` `size="icon-lg"`) that opens a `Sheet` (side="right") — `Sheet` already exists and already has mobile-responsive behavior built in (see how `Sidebar` reuses it for its mobile variant), so this is a drop-in fit.
- Wire to `api/ai` (§1, not yet built): create session on first open (`POST /ai/session/`), send messages (`POST /ai/chat`), load history (`GET /ai/session/{id}`).
- Persist `session_id` the same way `auth-token` is persisted in `auth.tsx` (`localStorage`), so the session survives navigation.

---

## 9. Employee Profile — make it real and editable

**File:** `components/page/ProfilePage.tsx` — **Status: ❌ Not started, unchanged.** Still calls a local mock `useCurrentUser()` hook instead of `useAuth()`, and is fully read-only.

- Replace `useCurrentUser()` with `useAuth()`'s real `user` object (same source `NavUser`/`nav-user.tsx` already use). Note: the current mock's `user.department` value (`"hr"`) and role (`"employee"`) don't match the real `User` type's invariant (`Employee.department` must be `null`) — this mock will need to go entirely, not just be swapped.
- Spec requires the profile to be **editable**. Add an edit form using `Field`/`FieldLabel`/`FieldContent` + `@tanstack/react-form` + `zod`, gated behind an "Edit" `Button` toggling form vs. display state — same pattern as `login.tsx`.
- Will need a corresponding `PATCH`/`PUT` user endpoint added to a new `api/users` client (same three-file pattern as §1) unless this is descoped for MVP — confirm.

---

## 10. Small gaps

- **404 page**: only `/unauthorized` exists (confirmed — no `routes/404.tsx` or catch-all in `routeTree.gen.ts`). Add one, styled consistently with `unauthorized.tsx` (same `Card` + icon + message layout). **Status: ❌ Not started.**
- **`TopicsSection.tsx` vs. `Section.tsx`**: `frontend/src/utils/Section.tsx` is still an empty file — confirm whether it's dead code to delete or a planned shared layout wrapper before building more sections. **Status: ❌ Unresolved.**

---

## What actually shipped since the last pass

For visibility, here's what's new in the codebase relative to the previous version of this doc:

- `api/tickets/` (mock + service + index) — the ticket API client, following the `api/auth` pattern.
- `types/tickets/` — `Ticket`, `HrRequest`, `ItTicket` types, re-exported from `types/index.ts`.
- `components/ticket-table.tsx` + `components/ui/data-table.tsx` — a generic, reusable ticket table built on `@tanstack/react-table`, with priority/status color-mapping helpers.
- `routes/_authenticated/admin/it/tickets.tsx` — a working (mock-backed) IT tickets list page with summary stat cards.
- A broader set of `components/ui/*` primitives is now in place (`Sheet`, `Field`, `Collapsible`, `DropdownMenu`, `Sidebar`, `Popover`, `Calendar`, `Select`, `Badge`, `Avatar`, `Breadcrumb`, `Tooltip`, `Table`, `Textarea`, `Skeleton`, `Separator`, `Label`) — the UI foundation for §§4–9 is essentially complete, so remaining work is page/route/API assembly rather than component-building.

---

## Suggested build order (updated)

1. ~~API clients (§1)~~ — `tickets` ✅ done; add missing status/comments endpoints to it; still need `documents` and `ai` clients — unblocks §§4, 6, 7, 8.
2. Ticket submission wiring (§2) + Ticket Detail Page (§4) — closes the core create → view loop. Now unblocked on the `tickets` client side; still needs comments/status endpoints added first.
3. Admin dashboards (§5) — decide table-vs-Kanban, then bring HR to parity with the existing IT list page; closes the status-workflow demo requirement.
4. AI Chat widget (§8) — required by demo script Q&A steps.
5. Knowledge Base real data (§6) + Documents management (§7).
6. Dashboard placeholders (§3), editable Profile (§9), 404 (§10).
