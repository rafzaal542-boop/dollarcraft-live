# Dollar Craft

## Firebase user storage

Registration uses Firebase Authentication for email/password credentials and
Firestore for user profiles. Passwords are never copied to Firestore or
`localStorage`. Profiles contain first and last name, email, a Firestore
server-generated `createdAt` timestamp, and wallet balance in integer cents.
The admin users table subscribes to Firestore snapshots so profile and balance
changes appear as they are committed.

Before deploying:

1. Enable **Email/Password** in Firebase Authentication and create the Firestore
   database for the project configured in `src/firebase.js`.
2. Provision `dollarcraft3@gmail.com` as an admin in Firebase Authentication and
   verify its email before release. The Firestore rules grant admin access only
   to that verified identity; do not expose an unverified admin account.
3. Publish the included rules with `firebase deploy --only firestore:rules`.
   The admin UI is not a security boundary by itself; the Firestore rules are
   required to protect user profiles and wallet balances.
4. Build and deploy the application with `npm run build`.

The old manual accounts existed only in each browser's local storage and cannot
be safely migrated into Firebase Authentication from the client. On first load,
the app removes those legacy local records (which included plaintext passwords);
users must create a Firebase account. Existing Firebase Authentication users
must also have a corresponding `users/{uid}` Firestore profile, except for the
provisioned admin account.

Firestore and Firebase Authentication provide shared persistent storage, but
availability, quotas, backup/retention, and billing depend on the Firebase
project configuration. Configure production backups and capacity monitoring
for the expected workload.
