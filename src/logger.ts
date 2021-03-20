import log4js from 'log4js';

export const configLogger = () => {
    log4js.configure({
        appenders: { upload_log: { type: "file", filename: "logs/upload.log",} },
        categories: { default: { appenders: ["upload_log"], level: "error" } }
    });
}

export const logError = (message: string) => {
    const logger = log4js.getLogger("upload_log");
    logger.error(message);
}

export const logInfo = (message: string) => {
    const logger = log4js.getLogger("upload_log");
    logger.info(message);
}
