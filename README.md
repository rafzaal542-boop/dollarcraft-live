# Dollar Craft

## Self-hosted authentication and user data

The application no longer uses Firebase or any Firebase API key. Authentication
and account data are handled by `server.mjs`:

- New accounts are stored in `data/users.json`, with per-account scrypt password
  hashes rather than plaintext passwords.
- Browser sessions use an HTTP-only, SameSite cookie; credentials and session
  tokens are not stored in localStorage.
- User records and wallet balances are persisted on the server. Admin user-list
  updates are streamed to the panel over server-sent events.
- The admin identity is `dollarcraft3@gmail.com`. Set `ADMIN_PASSWORD` privately
  in the server environment to the admin password. It is never bundled into
  client code or committed to the repository.

### Local development

1. Copy `.env.example` values into your shell environment (or your deployment
   secret manager). Set `ADMIN_PASSWORD` privately; do not commit a `.env` file.
2. Start the API in one terminal:

   ```powershell
   $env:ADMIN_PASSWORD = '<private admin password>'
   npm run server
   ```

3. Start the Vite app in another terminal with `npm run dev`. Vite proxies
   `/api` requests to the local API server on port 3001.

The admin account cannot register through the public registration form. Sign in
with its configured email and password. New user passwords must be at least 8
characters; only their scrypt hashes are written to the JSON data file.

### Production deployment and persistence

Run the Node API as a persistent service, set `ADMIN_PASSWORD` and optionally
`USER_DATA_DIR` in the service environment, and configure the production web
server to proxy `/api/*` to that same-origin API. Use HTTPS so the server marks
session cookies Secure. Back up the data directory and restrict filesystem
access to the service account.

This JSON-file backend is intended for a single API process with durable local
storage. It serializes writes and atomically replaces the data file, but it is
not a distributed database: do not run multiple API instances against the same
JSON file or use ephemeral serverless storage. For larger multi-instance
deployments, move the same API operations to a transactional database.

Existing accounts that were saved only in browser localStorage or Firebase are
not migrated automatically. Users must register again on this backend.
