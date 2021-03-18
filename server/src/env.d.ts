declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    REDIS_URL: string
    PORT: string
    SESSION_KEY: string
    CORS_ORIGIN: string
  }
}
