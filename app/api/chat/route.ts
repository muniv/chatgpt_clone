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

    // 사용자 입력 준비
    const userInput = messages[messages.length - 1]?.content || ""

    // Python 구조와 동일한 responses.create() 방식 (fetch 사용)
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        tools: [{ type: "web_search_preview" }, { type: "image_generation" }],
        input: userInput
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

    // Python 구조와 동일한 응답 처리 (response.output_text)
    let aiResponse = "응답을 생성할 수 없습니다."
    let hasImageGeneration = false
    let imageUrl = null

    // Python에서 response.output_text를 사용하는 것처럼
    if (data.output_text) {
      aiResponse = data.output_text
    }

    // 도구 호출 결과 처리 (이미지 생성 등)
    if (data.tool_calls && data.tool_calls.length > 0) {
      for (const toolCall of data.tool_calls) {
        if (toolCall.type === "image_generation" && toolCall.result) {
          hasImageGeneration = true
          // Base64 데이터를 이미지 URL로 변환
          imageUrl = `data:image/png;base64,${toolCall.result}`

          // 이미지 응답에 마크다운 형태로 추가
          aiResponse += `\n\n![생성된 이미지](${imageUrl})\n\n🎨 이미지 생성 완료: ${new Date().toLocaleString("ko-KR")}`
        }

        // web_search_preview 결과는 이미 output_text에 포함됨
        if (toolCall.type === "web_search_preview" && toolCall.result) {
          console.log("Web search result:", toolCall.result)
        }
      }
    }

    return NextResponse.json({
      response: aiResponse,
      hasImageGeneration,
      imageUrl
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
