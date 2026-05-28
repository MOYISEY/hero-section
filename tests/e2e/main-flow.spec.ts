import { expect, test } from "@playwright/test"

test("landing page and health endpoint are available", async ({ page, request }) => {
  const health = await request.get("/api/health")
  expect(health.ok()).toBeTruthy()

  const payload = await health.json()
  expect(payload.service).toBe("neuralbrief")

  await page.goto("/")
  await expect(page).toHaveTitle(/NeuralBrief|Create Next App|Next/i)
})

test("auth pages are reachable", async ({ page }) => {
  await page.goto("/login")
  await expect(page.locator("body")).toBeVisible()
})
