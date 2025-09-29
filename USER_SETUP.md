# User Management Setup

This document explains how to set up automatic user creation in your database when users sign up or sign in with Clerk.

## Overview

The system automatically creates users in your database through two mechanisms:

1. **Clerk Webhooks** (Primary method) - Automatically syncs users when they sign up, update, or delete their accounts
2. **Client-side Fallback** (Secondary method) - Ensures users are created even if webhooks fail

## Setup Instructions

### 1. Configure Clerk Webhooks

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to **Webhooks** in the sidebar
3. Click **Add Endpoint**
4. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/clerk`
5. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Copy the webhook secret (starts with `whsec_`)

### 2. Environment Variables

Add the webhook secret to your environment variables:

```bash
# .env.local
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Database Migration

If you haven't already, run the database migration to create the users table:

```bash
npm run db:generate
npm run db:migrate
```

## How It Works

### Webhook Handler (`/api/webhooks/clerk`)

- Receives webhook events from Clerk
- Verifies webhook signatures for security
- Automatically creates, updates, or deletes users in your database
- Handles `user.created`, `user.updated`, and `user.deleted` events

### User Service (`/services/userService.ts`)

Provides methods for user database operations:
- `createUser()` - Create a new user
- `updateUser()` - Update existing user
- `getUserById()` - Get user by ID
- `getUserByEmail()` - Get user by email
- `deleteUser()` - Delete user
- `upsertUser()` - Create or update user (handles both cases)

### Client-side Fallback (`UserSync` component)

- Automatically runs when users visit the dashboard
- Checks if the user exists in the database
- Creates the user if they don't exist
- Provides a safety net in case webhooks fail

### User API (`/api/users`)

Provides REST endpoints for user operations:
- `GET /api/users` - Get current user data
- `POST /api/users` - Create user (used by fallback)
- `PUT /api/users` - Update user data

## Database Schema

The `users` table includes:
- `id` - Clerk user ID (primary key)
- `email` - User's primary email address
- `firstName` - User's first name
- `lastName` - User's last name
- `imageUrl` - User's profile image URL
- `theme` - User's theme preference (defaults to 'system')
- `createdAt` - Timestamp when user was created
- `updatedAt` - Timestamp when user was last updated

## Testing

### Test User Creation

1. Sign up a new user through your app
2. Check your database to confirm the user was created
3. Verify the webhook endpoint is receiving events (check your logs)

### Test Fallback Mechanism

1. Temporarily disable webhooks in Clerk dashboard
2. Sign up a new user
3. Verify the user is still created via the fallback mechanism

## Troubleshooting

### Webhook Not Working

1. Check that `CLERK_WEBHOOK_SECRET` is set correctly
2. Verify the webhook URL is accessible
3. Check Clerk dashboard for webhook delivery status
4. Review server logs for errors

### User Not Created

1. Check if webhooks are enabled and configured
2. Verify the fallback mechanism is running (check browser console)
3. Check database connection and permissions
4. Review error logs

### Database Errors

1. Ensure the `users` table exists (run migrations)
2. Check database connection string
3. Verify user has proper database permissions

## Security Considerations

- Webhook signatures are verified to ensure requests come from Clerk
- User data is only created/updated from authenticated sources
- The system handles duplicate user creation gracefully
- All database operations are wrapped in try-catch blocks

## API Usage Examples

### Get Current User

```javascript
const response = await fetch('/api/users');
const user = await response.json();
```

### Update User Theme

```javascript
const response = await fetch('/api/users', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ theme: 'dark' })
});
```

### Create User (Fallback)

```javascript
const response = await fetch('/api/users', {
  method: 'POST'
});
```

## Files Modified/Created

- `src/app/[locale]/api/webhooks/clerk/route.ts` - Webhook handler
- `src/services/userService.ts` - User database operations
- `src/components/UserSync.tsx` - Client-side fallback
- `src/app/[locale]/api/users/route.ts` - User API endpoints
- `src/libs/Env.ts` - Added webhook secret environment variable
- `src/app/[locale]/(auth)/dashboard/layout.tsx` - Added UserSync component

This setup ensures that users are automatically created in your database whenever they interact with your application through Clerk authentication.
