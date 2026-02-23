import type { NextRequest } from 'next/server';
import { detectBot } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/assets(.*)',
  '/activity(.*)',
  '/calendar(.*)',
  '/settings(.*)',
  '/:locale/dashboard(.*)',
  '/:locale/assets(.*)',
  '/:locale/activity(.*)',
  '/:locale/calendar(.*)',
  '/:locale/settings(.*)',
]);

const isProtectedApiRoute = createRouteMatcher([
  '/api/assets(.*)',
  '/api/activities(.*)',
  '/api/calendar-events(.*)',
  '/api/notifications(.*)',
  '/api/objectives(.*)',
  '/api/todos(.*)',
  '/api/sprints(.*)',
  '/api/users(.*)',
  '/api/vehicles(.*)',
  '/:locale/api/assets(.*)',
  '/:locale/api/activities(.*)',
  '/:locale/api/calendar-events(.*)',
  '/:locale/api/notifications(.*)',
  '/:locale/api/objectives(.*)',
  '/:locale/api/todos(.*)',
  '/:locale/api/sprints(.*)',
  '/:locale/api/users(.*)',
  '/:locale/api/vehicles(.*)',
]);

const isAuthPage = createRouteMatcher([
  '/sign-in(.*)',
  '/:locale/sign-in(.*)',
  '/sign-up(.*)',
  '/:locale/sign-up(.*)',
]);

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

// Wrap in clerkMiddleware so auth() works in route handlers - Clerk requires it to run for all routes using auth()
export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Verify the request with Arcjet
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Cron routes: no auth, no i18n (secured by CRON_SECRET in the route)
  if (request.nextUrl.pathname.startsWith('/api/cron/')) {
    return NextResponse.next();
  }

  // Protected API routes: require auth
  if (isProtectedApiRoute(request)) {
    await auth.protect();
    return NextResponse.next();
  }

  // Protected pages and auth pages: protect and handle i18n
  if (isAuthPage(request) || isProtectedRoute(request)) {
    if (isProtectedRoute(request)) {
      const locale = request.nextUrl.pathname.match(/^\/([a-z]{2})\//)?.[1]
        ? `/${request.nextUrl.pathname.match(/^\/([a-z]{2})\//)?.[1]}`
        : '';
      const signInUrl = new URL(`${locale}/sign-in`, request.url);
      await auth.protect({
        unauthenticatedUrl: signInUrl.toString(),
      });
    }
    return handleI18nRouting(request);
  }

  return handleI18nRouting(request);
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
  runtime: 'nodejs',
};
