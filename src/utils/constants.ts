import { DateTime } from 'luxon'

const MAX_LOGGED_DEVICES = Number(process.env.MAX_LOGIN_ALLOWED) || 3

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || ''
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || ''
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const COOKIE_MAX_AGE = Number(process.env.JWT_COOKIE_MAX_AGE) || 24 * 60 * 60
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '60s'
const REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN || '86400s'
const region = process.env.Region || 'UTC'
const dateNow = DateTime.now().setZone(region).toJSDate()

export {
  MAX_LOGGED_DEVICES,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  COOKIE_MAX_AGE,
  IS_PRODUCTION,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  region,
  dateNow,
}
