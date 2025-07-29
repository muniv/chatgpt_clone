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
        '당신은 도움이 되고 친근한 AI 어시스턴트입니다. 사용자가 최신 정보나 실시간 데이터가 필요한 질문을 하면 web_search 함수를 사용해서 웹 검색을 수행하세요. 사용자가 "그려줘", "그려", "그림", "이미지" 등의 키워드로 이미지 생성을 요청하면 image_generation 함수를 사용해서 이미지를 생성하세요. 검색 결과나 이미지 생성 시 출처와 시간을 명시해주세요.'
    }
    const allMessages = [systemMessage, ...messages]

    // Chat Completions API 사용 (Function Calling 지원)
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
        temperature: 0.7,
        tools: [
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for current information",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query"
                  }
                },
                required: ["query"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "image_generation",
              description:
                "Generate an image based on a text prompt with conversation context",
              parameters: {
                type: "object",
                properties: {
                  prompt: {
                    type: "string",
                    description:
                      "The image generation prompt enhanced with conversation context"
                  },
                  conversation_context: {
                    type: "string",
                    description: "The full conversation history for context"
                  }
                },
                required: ["prompt", "conversation_context"]
              }
            }
          }
        ],
        tool_choice: "auto"
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.log("Chat Completions API Error:", errorData)
      return NextResponse.json(
        { error: "OpenAI API 호출 실패", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("Chat Completions API Response:", data)

    // Chat Completions API 응답 처리
    let aiResponse = "응답을 생성할 수 없습니다."
    let hasImageGeneration = false
    let imageUrl = null

    const choice = data.choices?.[0]
    if (!choice) {
      return NextResponse.json(
        { error: "응답 데이터가 없습니다." },
        { status: 500 }
      )
    }

    // Function Calling 처리
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      for (const toolCall of choice.message.tool_calls) {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)

        if (functionName === "web_search") {
          // 웹 검색 처리
          const searchQuery = functionArgs.query
          console.log("웹 검색 요청:", searchQuery)

          // SerpAPI 호출
          const searchResponse = await fetch(
            `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/search`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: searchQuery, apiKey })
            }
          )

          if (searchResponse.ok) {
            const searchData = await searchResponse.json()
            aiResponse =
              searchData.response || "검색 결과를 가져올 수 없습니다."
          } else {
            aiResponse = "검색 중 오류가 발생했습니다."
          }
        }

        if (functionName === "image_generation") {
          // 이미지 생성 처리 (대화 히스토리 포함)
          const imagePrompt = functionArgs.prompt
          const conversationContext = functionArgs.conversation_context

          console.log("이미지 생성 요청:", imagePrompt)
          console.log("대화 맥락:", conversationContext)

          try {
            // 대화 히스토리를 포함한 프롬프트 생성
            let enhancedPrompt = imagePrompt

            // 대화 맥락 추가
            if (conversationContext) {
              enhancedPrompt = `${imagePrompt}\n\nContext from conversation: ${conversationContext}`
            }

            // 한국어가 포함된 경우 영어로 번역
            if (/[가-힯]/.test(enhancedPrompt)) {
              const translationResponse = await fetch(
                "https://api.openai.com/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                  },
                  body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                      {
                        role: "system",
                        content:
                          "Translate Korean to English and optimize for DALL-E image generation. Make it detailed and artistic."
                      },
                      {
                        role: "user",
                        content: `Translate and optimize: "${enhancedPrompt}"`
                      }
                    ],
                    max_tokens: 200
                  })
                }
              )

              if (translationResponse.ok) {
                const translationData = await translationResponse.json()
                enhancedPrompt =
                  translationData.choices[0]?.message?.content || enhancedPrompt
              }
            }

            // DALL-E API 직접 호출
            const dalleResponse = await fetch(
              "https://api.openai.com/v1/images/generations",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                  model: "dall-e-3",
                  prompt: enhancedPrompt,
                  n: 1,
                  size: "1024x1024",
                  quality: "standard"
                })
              }
            )

            if (dalleResponse.ok) {
              const dalleData = await dalleResponse.json()
              hasImageGeneration = true
              imageUrl = dalleData.data[0]?.url
              aiResponse = `"대화 맥락을 반영한 ${imagePrompt}"에 대한 이미지를 생성했습니다:\n\n![생성된 이미지](${imageUrl})\n\n🎨 생성 시간: ${new Date().toLocaleString("ko-KR")}\n\n💬 대화 맥락 반영: 이전 대화 내용을 고려하여 이미지를 생성했습니다.`
            } else {
              const errorData = await dalleResponse.json()
              console.log("DALL-E API Error:", errorData)
              aiResponse =
                "이미지 생성 중 오류가 발생했습니다. API 키를 확인해주세요."
            }
          } catch (error) {
            console.error("Image generation error:", error)
            aiResponse = "이미지 생성 중 오류가 발생했습니다."
          }
        }
      }
    } else {
      // 일반 대화 응답
      aiResponse = choice.message.content || "응답을 생성할 수 없습니다."
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
