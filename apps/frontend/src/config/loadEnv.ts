import { config } from 'dotenv'
import { existsSync } from 'fs'
import path from 'path'

export function loadEnv() {
  const env = process.env.NODE_ENV || 'development'
  const envFile = path.resolve(process.cwd(), `.env.${env}`)
  if (existsSync(envFile)) {
    config({ path: envFile })
  }
}
