import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string(),
    SESSION_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CALLBACK_URL: z.string(),
    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.coerce.number(),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
    EMAIL_FROM: z.string(),
    CLIENT_URL: z.string(),
    PORT: z.coerce.number().default(3000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;
