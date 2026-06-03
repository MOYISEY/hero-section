import { ZodError, type ZodSchema } from "zod"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function parseJsonBody<T>(req: Request, schema: ZodSchema<T>) {
  const contentType = req.headers.get("content-type") || ""

  let data: unknown = null

  if (contentType.includes("application/json")) {
    data = await req.json().catch(() => null)
  } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null)
    if (form) {
      const obj: Record<string, unknown> = {}
      for (const [key, value] of form.entries()) {
        if (typeof value === "string") obj[key] = value
      }
      data = obj
    }
  } else {
    data = await req.json().catch(async () => {
      const form = await req.formData().catch(() => null)
      if (!form) return null
      const obj: Record<string, unknown> = {}
      for (const [key, value] of form.entries()) {
        if (typeof value === "string") obj[key] = value
      }
      return obj
    })
  }

  return schema.parse(data)
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
