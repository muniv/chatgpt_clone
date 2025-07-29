import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Chat API 호출 시작 ===")

    const { messages, apiKey } = await request.json()
    console.log("받은 메시지 수:", messages?.length)

    if (!apiKey) {
      console.error("API 키 누락")
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      )
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      console.error("잘못된 메시지 형식:", messages)
      return NextResponse.json(
        { error: "Messages must be a non-empty array" },
        { status: 400 }
      )
    }

    // 시스템 메시지와 대화 히스토리 결합
    const systemMessage = {
      role: "system",
      content: `당신은 도움이 되고 친근한 AI 어시스턴트입니다. 

**중요한 규칙:**
1. 사용자가 최신 정보나 실시간 데이터가 필요한 질문을 하면 반드시 web_search 함수를 사용하세요.
2. 사용자가 "그려줘", "그려", "그림", "이미지 생성", "만들어줘", "그려봐" 등 이미지 생성과 관련된 요청을 하면 반드시 image_generation 함수를 사용하세요.
3. 이미지 생성 시에는 대화의 전체 맥락을 conversation_context에 포함하세요.
4. 함수 호출 후 결과를 사용자에게 친근하게 설명해주세요.`
    }
    const allMessages = [systemMessage, ...messages]

    // 응답 처리를 위한 변수들
    let hasWebSearch = false
    let hasImageGeneration = false
    let searchResults = ""
    let imageUrl = ""
    let aiResponse = ""

    // 직접 이미지 생성 키워드 감지 (Function Calling 백업)
    const lastUserMessage = messages[messages.length - 1]?.content || ""
    const imageKeywords = [
      "그려줘",
      "그려",
      "그림",
      "이미지",
      "만들어줘",
      "그려봐",
      "draw",
      "create"
    ]
    const hasImageKeyword = imageKeywords.some(keyword =>
      lastUserMessage.toLowerCase().includes(keyword.toLowerCase())
    )

    console.log("마지막 사용자 메시지:", lastUserMessage)
    console.log("이미지 키워드 감지:", hasImageKeyword)

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
    console.log("Chat Completions API Response:", JSON.stringify(data, null, 2))

    // Function Calling 디버깅
    if (data.choices?.[0]?.message?.tool_calls) {
      console.log("함수 호출 감지:", data.choices[0].message.tool_calls)
    } else {
      console.log("함수 호출 없음 - 일반 응답")
    }

    // Chat Completions API 응답 처리 (변수 재할당)
    aiResponse = "응답을 생성할 수 없습니다."
    hasImageGeneration = false
    imageUrl = ""

    const choice = data.choices?.[0]
    if (!choice) {
      return NextResponse.json(
        { error: "응답 데이터가 없습니다." },
        { status: 500 }
      )
    }

    // Function Calling 처리 또는 직접 키워드 감지 처리
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      for (const toolCall of choice.message.tool_calls) {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)

        if (functionName === "web_search") {
          // 웹 검색 처리
          const searchQuery = functionArgs.query
          console.log("웹 검색 요청:", searchQuery)

          try {
            // SerpAPI 직접 호출
            const serpApiKey = process.env.SERPAPI_KEY
            if (!serpApiKey) {
              aiResponse =
                "검색 기능을 사용하려면 SERPAPI_KEY 환경 변수가 필요합니다."
            } else {
              const searchResponse = await fetch(
                `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${serpApiKey}&num=5`
              )

              if (searchResponse.ok) {
                const searchData = await searchResponse.json()

                if (
                  searchData.organic_results &&
                  searchData.organic_results.length > 0
                ) {
                  hasWebSearch = true
                  const results = searchData.organic_results
                    .slice(0, 3)
                    .map(
                      (result: any, index: number) =>
                        `${index + 1}. **${result.title}**\n   ${result.snippet}\n   🔗 출처: ${result.link}\n`
                    )
                    .join("\n")

                  searchResults = results
                  aiResponse = `"${searchQuery}"에 대한 최신 검색 결과입니다:\n\n${results}\n🔍 검색 시간: ${new Date().toLocaleString("ko-KR")}`
                } else {
                  aiResponse = `"${searchQuery}"에 대한 검색 결과를 찾을 수 없습니다.`
                }
              } else {
                const errorData = await searchResponse.json()
                console.log("SerpAPI Error:", errorData)
                aiResponse =
                  "검색 중 오류가 발생했습니다. API 키를 확인해주세요."
              }
            }
          } catch (error) {
            console.error("Search error:", error)
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
    } else if (hasImageKeyword) {
      // Function Calling이 실패했지만 이미지 키워드가 감지된 경우 직접 처리
      console.log("Function Calling 실패 - 직접 이미지 생성 처리")

      try {
        const imagePrompt = lastUserMessage
        const conversationContext = messages
          .slice(-3)
          .map((msg: any) => `${msg.role}: ${msg.content}`)
          .join("\n")

        console.log("직접 이미지 생성 요청:", imagePrompt)
        console.log("대화 맥락:", conversationContext)

        let enhancedPrompt = imagePrompt
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
        console.error("직접 이미지 생성 오류:", error)
        aiResponse = "이미지 생성 중 오류가 발생했습니다."
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
    console.error("=== Chat API 전체 에러 ===", error)

    // 에러 상세 정보 로깅
    if (error instanceof Error) {
      console.error("에러 메시지:", error.message)
      console.error("에러 스택:", error.stack)
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined
      },
      { status: 500 }
    )
  }
}
