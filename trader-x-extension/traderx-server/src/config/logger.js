// src/config/logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf, json } = format;

const devFormat = printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}`;
});

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: process.env.NODE_ENV === 'production'
        ? combine(timestamp(), json())
        : combine(
            colorize(),
            timestamp({ format: 'HH:mm:ss' }),
            devFormat
        ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ],
});

module.exports = logger;
