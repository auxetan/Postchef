import { ApiError } from './http.js'

export function requireEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new ApiError(
      503,
      'CONFIG_MISSING',
      `La configuration serveur ${name} est manquante.`,
    )
  }

  return value
}

export function optionalEnv(name, fallback = null) {
  return process.env[name] || fallback
}
