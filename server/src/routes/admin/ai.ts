import { Router } from "express"

const router = Router()

router.post("/ask", async (req, res) => {
  // AI 질문 처리 로직 구현

  const body = {
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: "Say this is a test!",
      },
    ],
  }

  const response = await fetch(
    "https://factchat-cloud.mindlogic.ai/v1/api/anthropic/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify(body),
    }
  )
  const data = (await response.json()) as any

  console.log("AI response data:", data)
  res.json(data.content)
})

export default router
