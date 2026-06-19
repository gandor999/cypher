import winston from 'winston';

const errorExtractor = winston.format((info) => {
  if (info instanceof Error) {
    // Explicitly assign custom properties so Winston serializes them
    Object.assign(info, {
      id: (info as any).id,
      name: info.name,
      isOperational: (info as any).isOperational
    });
  }
  return info;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    errorExtractor(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.prettyPrint({ colorize: true })
      )
    }),
    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info',
      format: winston.format.combine(
        winston.format.printf((info) => {
          return `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`;
        })
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.txt',
      level: 'error',
      format: winston.format.combine(
        winston.format.printf((info) => {
          const stack = info.stack 
            ? (Array.isArray(info.stack) ? info.stack.join('\n') : info.stack)
            : '  (No stack trace available)';

          return `
================================================================================
[${info.timestamp}] ERROR REPORT
================================================================================
ID          : ${info.id || 'N/A'}
Type        : ${info.name || 'Error'}
Message     : ${info.message}
Operational : ${info.isOperational !== undefined ? info.isOperational : 'Unknown'}
--------------------------------------------------------------------------------
Stack Trace:
${stack}
================================================================================
`;
        })
      )
    })
  ]
});

export default logger;
