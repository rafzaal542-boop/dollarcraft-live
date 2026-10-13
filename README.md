# Dollar Craft

## Shared accounts and MongoDB

Registration, sign-in, wallet balances, and the admin users table use the
Node.js account service in `server/` and a shared MongoDB database. User
documents contain first name, last name, normalized email, a salted scrypt
password hash, registration timestamp, wallet balance in cents, and an access
role. Plaintext passwords are never stored or returned by the API.

The admin users endpoint requires a server-issued, HTTP-only session and an
account for `dollarcraft3@gmail.com` whose password matches the server-only
`ADMIN_PASSWORD` setting. Registration and sign-in use the account API whenever
it is available. The admin users table loads from MongoDB
immediately and refreshes every two seconds, including after network failures
and when the page regains focus. A temporary outage leaves the last successful
results visible and reports that synchronization is retrying. Each user starts
with a zero-cent wallet balance.

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

The `dollarcraft3@gmail.com` address cannot be claimed through public
registration. Set `ADMIN_PASSWORD` to a private password of at least 12
characters, then run `npm run create-admin` against the configured database.
The provision command creates or updates only that administrator account and
stores a salted password hash. Keep `ADMIN_PASSWORD` configured for the running
API so administrator access can be verified; never commit the password or
`.env` file.

Registration and login are rate-limited. Session cookies are HTTP-only and
SameSite=Strict; production cookies are also Secure and therefore require
HTTPS. Account sessions expire after seven days.

If the account API returns 404 or cannot be reached, standard-user
registration and sign-in fall back to browser-local storage. Offline accounts
are device-specific, use a salted password hash, and are not synchronized to
MongoDB or included in the server-backed admin history. Administrator
authentication never falls back to the browser. Existing browser-local data
from older app versions is not used as an authentication source.

### Existing browser-local accounts

Accounts created by the previous local-only demo are not uploaded or migrated
automatically. Re-register users through the backend after deploying it. This
avoids treating editable local browser data as trusted account or wallet data.
