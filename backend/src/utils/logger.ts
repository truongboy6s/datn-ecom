export const logger = {
  info: (message: string, context?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context ? context : "");
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ? error : "");
  },
  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context ? context : "");
  },
};
