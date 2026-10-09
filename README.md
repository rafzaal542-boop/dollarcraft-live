# Dollar Craft

## Local demo account storage

Registration and sign-in run entirely in the browser; the app makes no backend
API or MongoDB requests. Profiles are stored under
`dollarcraft-local-users-v1` in the current browser's localStorage. Registration
adds the profile immediately and updates the admin table in the same tab; other
tabs on the same origin receive localStorage change events.

Passwords are never stored as plaintext. The demo derives a PBKDF2-SHA-256
password hash in the browser and stores the hash and random salt alongside the
profile. Sign-in state is stored as a local user ID, not as a password.
Existing `dollarcraft-users` records are migrated locally: their passwords are
re-hashed before the old plaintext data and session keys are removed.

**This is not suitable for production or real admin security.** Users can inspect
and modify localStorage, alter account balances or session state, and claim the
admin email on their own browser. The data does not synchronize to another
device or browser, and clearing site data removes it. The local admin account
must be registered in that browser; choose its password in the registration
form. This local-only demo does not enforce a server-provisioned administrator
password. Do not use real credentials, personal data, or wallet funds in this
demo.

Use an authenticated backend and shared database for production accounts,
cross-device synchronization, or protected administrator access.
