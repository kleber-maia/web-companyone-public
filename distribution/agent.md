# Install CompanyONE Beta

This document is the machine-readable installation contract for the public CompanyONE beta channel at https://companyone.ai/distribution.

The release package contains the compiled CompanyONE runtime, third-party runtime dependencies, database migrations, local-assistant skills, and release utilities. It does not contain the private source repository, original CompanyONE TypeScript or TSX files, tests, source maps, development history, environment files, company data, uploads, or backups.

## Safety rules

1. Install only on macOS with Apple silicon and Node.js 20 or newer.
2. Use a fresh PostgreSQL database owned by the beta tester. Never request or copy the publisher's database, backups, uploads, credentials, or environment files.
3. Obtain the tester's preferred CompanyONE URL, administrator email, administrator name, and a new administrator password directly from that tester.
4. Do not place the administrator password in chat, logs, shell history, or installation reports.
5. The installer verifies the HTTPS origin, Ed25519 release signature, package identity, and SHA-256 checksum before applying migrations or activating CompanyONE.

## Prerequisites

Confirm these commands exist:

```bash
node --version
psql --version
pg_dump --version
curl --version
```

If PostgreSQL is not installed on a Homebrew-managed Mac, install and start the current supported PostgreSQL package before continuing. Create a new empty database and verify the exact connection URL with `psql`.

## Required target-local values

- `COMPANYONE_DATABASE_URL`: PostgreSQL URL for the fresh target database.
- `COMPANYONE_APP_URL`: final URL beta users will open, including `https://` when a secure tunnel or reverse proxy is ready.
- `COMPANYONE_ADMIN_EMAIL`: first administrator's email.
- `COMPANYONE_ADMIN_PASSWORD`: a new target-only password.
- `COMPANYONE_ADMIN_NAME`: optional display name.

The optional `COMPANYONE_SERVICE_ROOT` changes the installation directory from `~/Services/companyone`. The optional `COMPANYONE_TIME_ZONE` controls automatic backup scheduling.

## Install

Set the required values only in the installer process environment, then run:

```bash
curl --fail --silent --show-error --location https://companyone.ai/distribution/install.sh | bash
```

The installer downloads the signed latest manifest from this origin and the compiled runtime from the approved public GitHub Release linked by that manifest. It creates target-local secrets, applies migrations to the fresh database, creates the first administrator, installs a per-user background service, starts CompanyONE, and checks its login page.

## Verify

Confirm the URL supplied as `COMPANYONE_APP_URL` reaches the CompanyONE login page. Confirm the background service is healthy without printing environment values:

```bash
launchctl print "gui/$(id -u)/com.companyone.production"
```

Report the installed version, service health, and login URL. Never report the database password, administrator password, generated authentication secret, or environment-file contents.

## Updates

CompanyONE checks `https://companyone.ai/distribution/releases/latest.json`. A global administrator reviews release notes and database changes under **Settings → Updates**, approves installation, and watches backup, download, migration, restart, and health verification progress. Updates reuse the public key pinned during installation and refuse altered, unsigned, wrong-platform, or older packages.

Current beta release: `20260921151742-da96989` published September 21, 2026.
