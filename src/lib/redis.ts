import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
) {
    logger.warn("⚠️ Upstash Redis environment variables are missing.");
}

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
