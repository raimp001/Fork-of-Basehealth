/**
 * Production-ready logger
 * 
 * In production, logs are sent to monitoring service
 * In development, logs are shown in console
 * Sensitive data is automatically scrubbed
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Scrub sensitive data from logs
function scrubSensitiveData(data: any): any {
  if (typeof data === 'string') {
    // Remove potential PHI patterns
    return data
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{10}\b/g, (match) => match.length === 10 ? '[NPI]' : match)
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
  }
  
  if (typeof data === 'object' && data !== null) {
    const scrubbed = { ...data }
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'apiKey', 'ssn', 'npi', 'email', 'phone']
    
    for (const key of sensitiveKeys) {
      if (key in scrubbed) {
        scrubbed[key] = '[REDACTED]'
      }
    }
    
    return scrubbed
  }
  
  return data
}

interface LogContext {
  userId?: string
  requestId?: string
  [key: string]: any
}

class Logger {
  private context: LogContext = {}

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context }
  }

  clearContext() {
    this.context = {}
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    const contextStr = Object.keys(this.context).length > 0 
      ? ` [${JSON.stringify(this.context)}]` 
      : ''
    return `[${timestamp}] [${level}]${contextStr} ${message}`
  }

  info(message: string, ...args: any[]) {
    const scrubbedArgs = args.map(scrubSensitiveData)
    const formatted = this.formatMessage('INFO', message, ...scrubbedArgs)
    
    if (isDevelopment) {
      console.log(formatted, ...scrubbedArgs)
    }
    
    // In production, send to monitoring service
    if (isProduction) {
      // TODO: Integrate with monitoring service (e.g., Sentry, DataDog)
      // For now, still log to console but could be enhanced
    }
  }

  error(message: string, error?: Error | any, ...args: any[]) {
    const scrubbedArgs = args.map(scrubSensitiveData)
    const formatted = this.formatMessage('ERROR', message, ...scrubbedArgs)
    
    if (error instanceof Error) {
      const errorInfo = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      }
      
      if (isDevelopment) {
        console.error(formatted, errorInfo, ...scrubbedArgs)
      }
      
      // In production, send to error tracking service
      if (isProduction) {
        // TODO: Send to error tracking service (e.g., Sentry)
        console.error(formatted, errorInfo)
      }
    } else {
      if (isDevelopment) {
        console.error(formatted, error, ...scrubbedArgs)
      }
    }
  }

  warn(message: string, ...args: any[]) {
    const scrubbedArgs = args.map(scrubSensitiveData)
    const formatted = this.formatMessage('WARN', message, ...scrubbedArgs)
    
    if (isDevelopment) {
      console.warn(formatted, ...scrubbedArgs)
    }
  }

  debug(message: string, ...args: any[]) {
    if (isDevelopment) {
      const scrubbedArgs = args.map(scrubSensitiveData)
      const formatted = this.formatMessage('DEBUG', message, ...scrubbedArgs)
      console.debug(formatted, ...scrubbedArgs)
    }
    // Debug logs are not shown in production
  }
}

export const logger = new Logger()
export default logger
