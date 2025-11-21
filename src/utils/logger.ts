// Logger utility for consistent logging across the app

import { ENV } from './constants';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = ENV.ENVIRONMENT === 'development';

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return data ? `${prefix} ${message} ${JSON.stringify(data)}` : `${prefix} ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: any): void {
    console.error(this.formatMessage('error', message, error));
  }
}

export const logger = new Logger();



