import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages, apiKey } = await request.json()

    if (!messages || !apiKey) {
      return NextResponse.json(
        { error: "Messages and API key are required" },
        { status: 400 }
      )
    }

    // 메시지 배열 검증
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages must be a non-empty array" },
        { status: 400 }
      )
    }

    // 시스템 메시지와 대화 히스토리 결합
    const systemMessage = {
      role: "system",
      content:
        "당신은 도움이 되고 친근한 AI 어시스턴트입니다. 사용자의 질문에 정확하고 유용한 답변을 제공하세요. 이전 대화 내용을 기억하고 맥락에 맞는 대화를 이어가세요."
    }

    const allMessages = [systemMessage, ...messages]

    // OpenAI API 호출 (GPT-4o 고정, 대화 히스토리 포함)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: allMessages,
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: "OpenAI API 호출 실패", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiResponse =
      data.choices[0]?.message?.content || "응답을 생성할 수 없습니다."

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
