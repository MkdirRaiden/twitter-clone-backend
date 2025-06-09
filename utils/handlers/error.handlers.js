export const handleUncaughtException = () => {
    process.on("uncaughtException", (err) => {
        console.error(`UncaughtException: ${err.name} - ${err.message}`);
        console.error(err.stack);
        process.exit(1);
    });
};

export const handleUnhandledRejection = (server) => {
    process.on("unhandledRejection", (err) => {
        console.error(`UnhandledRejection: ${err.name} - ${err.message}`);
        console.error(err.stack);
        if (server) {
            server.close(() => process.exit(1));
        } else {
            process.exit(1);
        }
    });
};

export const handleTerminationSignals = (server) => {
    const shutdown = (signal) => {
        console.log(`${signal} received. Shutting down gracefully...`);
        if (server) {
            server.close(() => process.exit(0));
        } else {
            process.exit(0);
        }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
};
