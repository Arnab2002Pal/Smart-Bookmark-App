# List of problems and their solution:

Phase 1: Authentication & Redirects
1. Unsupported provider: missing OAuth secret (Google OAuth fails).
- Created OAuth credentials in Google Cloud Console; added Client ID and Secret to Supabase Auth settings.

2. Unable to exchange external code (OAuth Redirect Error).
- Matched the Redirect URI in Google Console with the Supabase auth/v1/callback URL and updated SITE_URL.

3. Redirecting to /# after login (UI doesn't update).
- Used supabase.auth.onAuthStateChange() to programmatically handle the session.

4. 404 on /dashboard.
- Corrected App Router structure to app/dashboard/page.tsx.

Phase 2: Real-time Sync & Database
1. Manual Refresh Required (Real-time not working).
- Manually enabled Realtime for the bookmarks table in the Supabase Dashboard.

2. Implementation of Optimistic UI development (frontend development approach that improves perceived performance by immediately updating the user interface to reflect a successful action)
- Rnd on it and ways to implement it.

3. DELETE Not Working in Realtime (Event fires but data is empty).
- Ran ALTER TABLE bookmarks REPLICA IDENTITY FULL; so Postgres sends the full row data on deletion.

4. AuthSessionMissingError (App crashes on refresh).
- Replaced getUser() with getSession() to handle null sessions gracefully without throwing errors.

5. Multi-Tab Logout Not Syncing.
- Implemented an onAuthStateChange listener to force a UI state refresh across all open tabs when a user signs out.


Phase 3: Performance & Edge Cases:
1. UI Lag in current tab (feels slow).
- Update the local state immediately, then let the Real-time event confirm it.

2. Duplicate Items appearing.
- Added a check in the Real-time payload handler: if (prev.some(b => b.id === payload.new.id)) return prev;

Coding Error:
1. Subscription Reconnecting Frequently
- Dependency array incorrect

Architecture Decisions Made
- Used Supabase Auth (Google provider only)
- Implemented Row Level Security
- Enabled Realtime for cross-tab sync
- Used App Router client components
- Ensured multi-tab auth synchronization

Important Reference Doc:
- https://supabase.com/docs/reference/javascript/auth-onauthstatechange
- https://supabase.com/docs/guides/realtime/postgres-changes
