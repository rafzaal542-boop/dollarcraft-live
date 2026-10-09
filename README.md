# Dollar Craft

## Shared accounts and MongoDB

Registration, sign-in, wallet balances, and the admin users table use the
Node.js account service in `server/` and a shared MongoDB database. User
documents contain first name, last name, normalized email, a salted scrypt
password hash, registration timestamp, wallet balance in cents, and an access
role. Plaintext passwords are never stored or returned by the API.

The admin users endpoint requires a server-issued, HTTP-only session and an
account with the `admin` role. The users table refreshes from MongoDB every five
seconds, so registrations from other devices and locations appear without a
browser-local account store. Each user starts with a zero-cent wallet balance.

### Configure and run locally

1. Create a MongoDB database and set its network access rules so this server can
   connect. Keep the connection URI private.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to the connection URI.
   `.env` is ignored by Git.
3. Start the API in one terminal with `npm run start`.
4. Start the Vite app in another terminal with `npm run dev`.

Vite proxies `/api` to the local account service on port 3001. For production,
build the frontend with `npm run build`, set the production environment
variables, and run `npm run start` behind HTTPS. The service serves the built
frontend and API from the same origin. Set `TRUST_PROXY=1` only if exactly one
trusted reverse proxy is in front of the service.

### Provision the administrator

The configured `ADMIN_EMAIL` cannot be claimed through public registration.
Set `ADMIN_PASSWORD` temporarily to a unique password of at least 12
characters, then run `npm run create-admin` against the configured database.
The provision command creates or updates only that administrator account and
stores the password hash. Remove `ADMIN_PASSWORD` from the environment after
the command completes. Do not commit database credentials or admin passwords.

Registration and login are rate-limited. Session cookies are HTTP-only and
SameSite=Strict; production cookies are also Secure and therefore require
HTTPS. Account sessions expire after seven days.

### Existing browser-local accounts

Accounts created by the previous local-only demo are not uploaded or migrated
automatically. Re-register users through the backend after deploying it. This
avoids treating editable local browser data as trusted account or wallet data.
