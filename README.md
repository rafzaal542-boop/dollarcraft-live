# Dollar Craft

## Self-hosted authentication and user data

The application no longer uses Firebase or any Firebase API key. Authentication
and account data are handled by `server.mjs` and MongoDB:

- New account profiles are inserted into the MongoDB `users` collection with a
  unique email index, server-generated timestamp, and wallet balance. Passwords
  are hashed with scrypt before insertion; plaintext passwords are never stored
  or exposed to the admin panel.
- Browser sessions use an HTTP-only, SameSite cookie; credentials and session
  tokens are not stored in localStorage.
- User records and wallet balances are persisted on the server. Admin user-list
  updates are streamed to the panel over server-sent events.
- The admin identity is `dollarcraft3@gmail.com`. Set `ADMIN_PASSWORD` privately
  in the server environment to the admin password. It is never bundled into
  client code or committed to the repository.

### Local development

1. Configure `MONGODB_URI`, `MONGODB_DB_NAME`, and `ADMIN_PASSWORD` in your shell
   environment (or deployment secret manager). Never commit these secrets.
2. Start the API in one terminal:

   ```powershell
   $env:ADMIN_PASSWORD = '<private admin password>'
   $env:MONGODB_URI = 'mongodb://127.0.0.1:27017'
   npm run server
   ```

3. Start the Vite app in another terminal with `npm run dev`. Vite proxies
   `/api` requests to the local API server on port 3001.

The admin account cannot register through the public registration form. Sign in
with `dollarcraft3@gmail.com` and the configured admin password. New user
passwords must be at least 8 characters; only their scrypt hashes are stored.

### Production deployment and persistence

Run the Node API as a persistent service, set `MONGODB_URI`,
`MONGODB_DB_NAME`, and `ADMIN_PASSWORD` in the service environment, and
configure the production web server to proxy `/api/*` to that same-origin API.
Use HTTPS so the server marks session cookies Secure. MongoDB change streams
require a replica set (MongoDB Atlas provides this); the API uses them to push
profile and wallet changes to connected admin panels without waiting for a
polling interval. Configure MongoDB backups, authentication, and network
restrictions for production.

Sessions are held by the API process, so use one API instance unless session
storage is moved to a shared session service.

Existing accounts that were saved only in browser localStorage, the earlier
JSON prototype, or Firebase are not migrated automatically. Users must register
again on this backend.
