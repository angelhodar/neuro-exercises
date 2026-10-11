# Authentication and authorization

## Identity

`lib/auth/auth.server.ts` configures Better Auth with the Drizzle PostgreSQL adapter, email/password login, the admin and organization plugins, and Next.js cookies. Public sign-up is disabled. HTTP auth rate limits are stored in `auth_rate_limits`; session cookie caching lasts five minutes.

`app/api/auth/[...all]/route.ts` exposes auth endpoints. Client helpers live in `lib/auth/auth.client.ts`. Use a stable secret and canonical origin in each environment.

## First administrator: operator bootstrap

After migrations, set the three `BOOTSTRAP_ADMIN_*` values described in [local development](local-development.md), verify the database target, and run:

```bash
npm run db:bootstrap-admin -- --confirm
```

The CLI prints only the database hostname/port/database, not connection credentials. Without `--confirm` it exits before connecting/writing. It validates email, name, and a 12–128-character password, then uses a single TCP connection and transaction:

1. Lock the users table to serialize concurrent bootstrap attempts.
2. If the email already belongs to an admin, exit successfully without modifying it.
3. If the email belongs to a non-admin, refuse to promote/reset it.
4. If another admin already exists, refuse; use the authenticated admin dashboard instead.
5. Create an admin user and its `credential` account atomically, hashing with `better-auth/crypto`.

There is no hard-coded administrator password, silent reset, HTTP bootstrap endpoint, organization seed or fake media seed. Email verification remains false; the script does not claim to verify ownership of the email. It also does not repair an existing admin with missing credentials. Remove bootstrap secrets after use.

The operator can technically target any reachable database: confirmation is a safeguard, not an access-control boundary. Production provisioning must be deliberate and backed up. Recovery/reset procedures are still unresolved.

## Roles and resource permissions

- Platform `admin` can manage users; regular users cannot provision accounts or enumerate the platform user list.
- Organization `owner`, `admin`, and `member` are separate membership roles. Management follows Better Auth's lifecycle; ownership changes/deletion require owner privileges and last-owner protection applies.
- Exercise editing and preview use `assertCanEditExercise`: creator or platform admin.
- Requirements drafts are private to their creator, with revision checks on changes.
- Patients and their sessions/tests are creator-scoped, not automatically shared across an organization.

`requireAuth` and `requireAdmin` fetch database-backed session state with `disableCookieCache: true`; privileged actions must not rely on stale cached roles or revoked sessions. `withAuth` is available for API routes. Some routes explicitly implement the same session revalidation.

`proxy.ts` checks only whether a session cookie exists before redirecting `/dashboard` visitors to login. A forged/stale cookie passing that check still needs server-side authorization.

## Invitations and email

Organization invitations expire after seven days and require verified ownership of the recipient email. The server config does not currently wire email verification delivery, invitation email delivery, or password-reset email callbacks. Database invitation creation should not be mistaken for a complete deliverable email workflow.

## Coverage and limitations

`npm run test:auth` covers unauthorized administration, organization boundaries/last owner, invitation verification, upload token authentication, creator-scoped patients/drafts, revoked sessions, demoted admins and rate limits. `npm run test:setup` covers bootstrap safety and credential hashes.

These are targeted regressions, not a blanket security audit. In particular, media deletion, globally readable resources, templates, share-link execution/results and clinical-data lifecycle need further review. See [known gaps](known-gaps.md).
