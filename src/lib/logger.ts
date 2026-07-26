import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const pinoLogger = pino({
    level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
    browser: {
        asObject: true,
    },
    base: {
        env: process.env.NODE_ENV || "development",
        service: "frozen-lunar",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

export const logger = {
    info: (message: string, meta?: Record<string, unknown>) => {
        pinoLogger.info(meta || {}, message);
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
        pinoLogger.warn(meta || {}, message);
    },
    error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
        const errorMeta =
            error instanceof Error
                ? {
                      errorMessage: error.message,
                      errorStack: error.stack,
                      errorName: error.name,
                      ...meta,
                  }
                : { error, ...meta };

        pinoLogger.error(errorMeta, message);
    },
    debug: (message: string, meta?: Record<string, unknown>) => {
        pinoLogger.debug(meta || {}, message);
    },
};
