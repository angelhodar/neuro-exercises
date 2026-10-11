# Accounts and permissions

## Accounts

Users sign in with email and password. Public sign-up is disabled; administrators provision accounts.

The first administrator is created explicitly by an operator after database setup:

```bash
npm run db:bootstrap-admin -- --confirm
```

Provide the bootstrap email, name, and password through the environment, verify the database target, and remove those credentials after provisioning. See [local development](local-development.md).

The bootstrap creates credentials safely without overwriting an existing account. It refuses to promote an existing non-admin or create another initial administrator when one already exists. It is not a password-reset or account-recovery tool.

## Permissions

- **Platform administrators** manage user accounts.
- **Organization owners and administrators** manage their organizations within their assigned permissions.
- **Exercise creators and platform administrators** can edit an exercise and access its authoring previews.
- **Requirements drafts and patient records** are scoped to their creators.

Organization membership does not automatically make every resource shared with that organization, nor does it establish complete tenant isolation.

## Server-side checks

Sensitive actions revalidate sessions and permissions rather than trusting a navigation redirect or cached role alone. Logged-in access to a page is not sufficient authorization for every operation behind it.

## Email and recovery

Invitation acceptance requires verified ownership of the recipient email. Email delivery, verification, and self-service recovery still need a complete operational setup. Creating an invitation record should not be mistaken for sending a usable invitation email.

Existing regression tests cover important boundaries, but are not a comprehensive security audit. See [known gaps](known-gaps.md) before expanding access.
