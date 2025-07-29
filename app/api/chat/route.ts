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
        '당신은 도움이 되고 친근한 AI 어시스턴트입니다. 사용자가 최신 정보나 실시간 데이터가 필요한 질문을 하면 web_search 함수를 사용해서 웹 검색을 수행하세요. 사용자가 "그려줘", "그려", "그림", "이미지" 등의 키워드로 이미지 생성을 요청하면 image_generation 도구를 사용해서 이미지를 생성하세요. 검색 결과나 이미지 생성 시 출처와 시간을 명시해주세요.'
    }
    const allMessages = [systemMessage, ...messages]

    // OpenAI Responses API 호출 (GPT-4o 고정, 대화 히스토리 포함, 도구 지원)
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        input: allMessages[allMessages.length - 1].content, // 최신 사용자 입력
        messages: allMessages.slice(0, -1), // 이전 대화 히스토리
        max_tokens: 2000,
        temperature: 0.7,
        tools: [
          {
            type: "web_search"
          },
          {
            type: "image_generation"
          }
        ]
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

    // Responses API 응답 구조 처리
    let aiResponse = "응답을 생성할 수 없습니다."
    let hasImageGeneration = false
    let imageUrl = null

    if (data.output && data.output.length > 0) {
      // 텍스트 응답 찾기
      const textOutput = data.output.find(
        (output: any) => output.type === "text"
      )
      if (textOutput) {
        aiResponse = textOutput.content || textOutput.text
      }

      // 이미지 생성 결과 찾기
      const imageOutput = data.output.find(
        (output: any) => output.type === "image_generation_call"
      )
      if (imageOutput && imageOutput.result) {
        hasImageGeneration = true
        // Base64 데이터를 이미지 URL로 변환
        imageUrl = `data:image/png;base64,${imageOutput.result}`

        // 이미지 응답에 마크다운 형태로 추가
        aiResponse += `\n\n![생성된 이미지](${imageUrl})\n\n🎨 이미지 생성 완료: ${new Date().toLocaleString("ko-KR")}`
      }
    } else if (data.choices && data.choices[0]) {
      // 기존 Chat Completions 형태 fallback
      aiResponse =
        data.choices[0]?.message?.content || "응답을 생성할 수 없습니다."
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
