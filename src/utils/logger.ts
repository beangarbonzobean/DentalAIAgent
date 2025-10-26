import winston from 'winston';

/**
 * Winston logger configuration with colorized console output
 * Log levels: debug, info, warning, error, critical
 */

const logLevel = process.env.LOG_LEVEL || 'info';

const customLevels = {
  levels: {
    critical: 0,
    error: 1,
    warning: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    critical: 'red bold',
    error: 'red',
    warning: 'yellow',
    info: 'green',
    debug: 'blue',
  },
};

winston.addColors(customLevels.colors);

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, ...metadata }) => {
          let msg = `[${timestamp}] ${level}: ${message}`;
          
          // Add metadata if present
          if (Object.keys(metadata).length > 0) {
            const metaStr = JSON.stringify(metadata, null, 2);
            if (metaStr !== '{}') {
              msg += ` ${metaStr}`;
            }
          }
          
          return msg;
        })
      ),
    }),
  ],
});

export default logger;
