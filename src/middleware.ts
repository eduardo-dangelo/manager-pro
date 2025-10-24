import type { NextFetchEvent, NextRequest } from 'next/server';
import { detectBot } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/projects(.*)',
  '/year-planner(.*)',
  '/settings(.*)',
  '/user-profile(.*)',
  '/:locale/dashboard(.*)',
  '/:locale/projects(.*)',
  '/:locale/year-planner(.*)',
  '/:locale/settings(.*)',
  '/:locale/user-profile(.*)',
]);

const isProtectedApiRoute = createRouteMatcher([
  '/api/projects(.*)',
  '/api/objectives(.*)',
  '/api/todos(.*)',
  '/api/sprints(.*)',
  '/api/users(.*)',
  '/:locale/api/projects(.*)',
  '/:locale/api/objectives(.*)',
  '/:locale/api/todos(.*)',
  '/:locale/api/sprints(.*)',
  '/:locale/api/users(.*)',
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

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Handle protected API routes (no i18n routing needed)
  if (isProtectedApiRoute(request)) {
    return clerkMiddleware(async (auth) => {
      await auth.protect();
    })(request, event);
  }

  // Clerk keyless mode doesn't work with i18n, this is why we need to run the middleware conditionally
  if (
    isAuthPage(request) || isProtectedRoute(request)
  ) {
    return clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        // Extract locale from pathname (e.g., /en/projects -> /en)
        const locale = req.nextUrl.pathname.match(/^\/([a-z]{2})\//)?.[1] ? `/${req.nextUrl.pathname.match(/^\/([a-z]{2})\//)?.[1]}` : '';

        const signInUrl = new URL(`${locale}/sign-in`, req.url);

        await auth.protect({
          unauthenticatedUrl: signInUrl.toString(),
        });
      }

      return handleI18nRouting(req);
    })(request, event);
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
  runtime: 'nodejs',
};
