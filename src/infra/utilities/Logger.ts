class Logger {
  info(message: string, ...optionalParams: any[]) {
    this.log('INFO', message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]) {
    this.log('WARN', message, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]) {
    this.log('ERROR', message, ...optionalParams);
  }

  private log(level: string, message: string, ...optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, ...optionalParams);
  }
}

export const logger = new Logger();
