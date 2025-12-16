import { createEnv } from '@t3-oss/env-nextjs';
import z from 'zod';

export const Env = createEnv({
  server: {
    ARCJET_KEY: z.string().startsWith('ajkey_').optional(),
    CLERK_SECRET_KEY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    // DVLA Vehicle Enquiry Service (VES)
    DVLA_VES_API_URL: z.string().url().optional(),
    DVLA_VES_API_KEY: z.string().optional(),
    // MOT History API (DVSA)
    MOT_HISTORY_TOKEN_URL: z.string().url().optional(),
    MOT_HISTORY_SCOPE: z.string().optional(),
    MOT_HISTORY_CLIENT_ID: z.string().optional(),
    MOT_HISTORY_CLIENT_SECRET: z.string().optional(),
    MOT_HISTORY_API_KEY: z.string().optional(),
    MOT_HISTORY_VEHICLE_URL: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().optional(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    ARCJET_KEY: process.env.ARCJET_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    DVLA_VES_API_URL: process.env.DVLA_VES_API_URL,
    DVLA_VES_API_KEY: process.env.DVLA_VES_API_KEY,
    MOT_HISTORY_TOKEN_URL: process.env.MOT_HISTORY_TOKEN_URL,
    MOT_HISTORY_SCOPE: process.env.MOT_HISTORY_SCOPE,
    MOT_HISTORY_CLIENT_ID: process.env.MOT_HISTORY_CLIENT_ID,
    MOT_HISTORY_CLIENT_SECRET: process.env.MOT_HISTORY_CLIENT_SECRET,
    MOT_HISTORY_API_KEY: process.env.MOT_HISTORY_API_KEY,
    MOT_HISTORY_VEHICLE_URL: process.env.MOT_HISTORY_VEHICLE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NODE_ENV: process.env.NODE_ENV,
  },
});
