import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto"

const iterations = 120000
const keyLength = 64
const digest = "sha512"

export type Role = "client" | "manager" | "developer" | "director"

export const roles: Role[] = ["client", "manager", "developer", "director"]

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && roles.includes(value as Role)
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex")

  return `${iterations}:${salt}:${hash}`
}

export function verifyPassword(password: string, passwordHash: string) {
  const [storedIterations, salt, storedHash] = passwordHash.split(":")
  const iterationCount = Number(storedIterations)

  if (!iterationCount || !salt || !storedHash) return false

  const hash = pbkdf2Sync(password, salt, iterationCount, keyLength, digest).toString("hex")
  const storedBuffer = Buffer.from(storedHash, "hex")
  const currentBuffer = Buffer.from(hash, "hex")

  if (storedBuffer.length !== currentBuffer.length) return false

  return timingSafeEqual(storedBuffer, currentBuffer)
}
