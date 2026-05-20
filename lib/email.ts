type EmailNotification = {
  to: string | null | undefined
  subject: string
  text: string
}

export async function sendEmailNotification({ to, subject, text }: EmailNotification) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || "NeuralBrief <onboarding@resend.dev>"

  if (!apiKey || !to) {
    console.warn("[email] skipped:", !apiKey ? "RESEND_API_KEY is missing" : "recipient email is missing")
    return { skipped: true }
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  })

  if (!response.ok) {
    const message = await response.text().catch(() => "Email provider error")
    console.error("[email] failed:", response.status, message)
    return { skipped: false, error: message }
  }

  console.info("[email] sent:", subject, "to", to)
  return { skipped: false, ok: true }
}
