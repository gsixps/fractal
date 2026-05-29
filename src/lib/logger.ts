type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: unknown
}

const isProduction = process.env.NODE_ENV === 'production'

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// In production, minimum level is warn
const MIN_LOG_LEVEL: LogLevel = isProduction ? 'warn' : 'debug'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL]
}

function formatTimestamp(): string {
  return new Date().toISOString()
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const entry = {
    timestamp: formatTimestamp(),
    level,
    message,
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
  }
  return JSON.stringify(entry)
}

export const logger = {
  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, context))
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, context))
    }
  },

  error(message: string, context?: LogContext): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, context))
    }
  },

  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, context))
    }
  },
}
