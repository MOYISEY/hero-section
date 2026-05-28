import { ZodError, type ZodSchema } from "zod"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function parseJsonBody<T>(req: Request, schema: ZodSchema<T>) {
  const body = await req.json().catch(() => null)
  return schema.parse(body)
}

export function validationErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "Invalid request body",
        details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      { status: 400 },
    )
  }

  return null
}

export function rateLimitResponse(req: Request, namespace: string, limit: number, windowMs: number) {
  const rateLimit = checkRateLimit(`${namespace}:${getClientIp(req)}`, limit, windowMs)

  if (rateLimit.allowed) return null

  return Response.json(
    { error: "Too many requests. Please wait and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
      },
    },
  )
}
