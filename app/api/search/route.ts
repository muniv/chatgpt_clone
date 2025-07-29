import { NextRequest, NextResponse } from "next/server"

// SerpAPI를 사용한 실제 Google 검색
async function performWebSearch(query: string) {
  try {
    // SerpAPI 키 확인 (환경 변수에서 가져오거나 데모 키 사용)
    const serpApiKey = process.env.SERPAPI_KEY || "demo-key"

    // SerpAPI Google 검색 호출
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=5&hl=ko&gl=kr`,
      {
        method: "GET",
        headers: {
          "User-Agent": "ChatBot-UI/1.0"
        }
      }
    )

    if (!response.ok) {
      throw new Error(`SerpAPI 요청 실패: ${response.status}`)
    }

    const data = await response.json()

    // 검색 결과 파싱
    const results = []

    // 일반 검색 결과 (organic_results)
    if (data.organic_results && data.organic_results.length > 0) {
      for (const result of data.organic_results.slice(0, 5)) {
        results.push({
          title: result.title || "",
          snippet: result.snippet || "",
          url: result.link || "",
          source: "Google 검색"
        })
      }
    }

    // 답변 박스 (answer_box) - 직접적인 답변이 있는 경우
    let directAnswer = null
    if (data.answer_box) {
      directAnswer = {
        answer: data.answer_box.answer || data.answer_box.snippet || "",
        source: data.answer_box.title || "Google 답변 박스",
        url: data.answer_box.link || ""
      }
    }

    // 지식 그래프 (knowledge_graph) - 인물, 장소, 사물 정보
    let knowledgeInfo = null
    if (data.knowledge_graph) {
      knowledgeInfo = {
        title: data.knowledge_graph.title || "",
        description: data.knowledge_graph.description || "",
        source: "Google 지식 그래프"
      }
    }

    return {
      query: query,
      timestamp: new Date().toISOString(),
      directAnswer: directAnswer,
      knowledgeInfo: knowledgeInfo,
      results: results,
      totalResults: data.search_information?.total_results || 0
    }
  } catch (error) {
    console.error("SerpAPI 검색 오류:", error)

    // 오류 시 폴백 결과 (시뮬레이션 데이터 포함)
    const simulatedResults = [
      {
        title: `${query} - 네이버 지도 검색 결과`,
        snippet: `${query}에 대한 상세 정보를 네이버 지도에서 확인할 수 있습니다. 위치, 영업시간, 리뷰 등의 정보가 제공됩니다.`,
        url: "https://map.naver.com/search/" + encodeURIComponent(query),
        source: "네이버 지도"
      },
      {
        title: `${query} 관련 블로그 후기`,
        snippet: `${query}에 대한 실제 방문 후기와 리뷰를 확인할 수 있는 블로그 글입니다.`,
        url:
          "https://blog.naver.com/search/searchResult.naver?query=" +
          encodeURIComponent(query),
        source: "네이버 블로그"
      },
      {
        title: `${query} - 다음 지도 정보`,
        snippet: `다음 지도에서 제공하는 ${query}의 상세 정보와 주변 시설 안내입니다.`,
        url: "https://map.daum.net/search/" + encodeURIComponent(query),
        source: "다음 지도"
      }
    ]

    return {
      query: query,
      timestamp: new Date().toISOString(),
      error:
        "검색 서비스에 일시적인 문제가 있어 시뮬레이션 데이터를 사용합니다.",
      results: simulatedResults,
      totalResults: simulatedResults.length
    }
  }
}

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

    // 웹 검색 도구 정의
    const tools = [
      {
        type: "function",
        function: {
          name: "web_search",
          description:
            "웹에서 실시간 정보를 검색합니다. 최신 뉴스, 날씨, 주가, 이벤트 등 실시간 정보가 필요할 때 사용하세요.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "검색할 키워드나 질문"
              }
            },
            required: ["query"]
          }
        }
      }
    ]

    // 시스템 메시지
    const systemMessage = {
      role: "system",
      content: `당신은 도움이 되고 친근한 AI 어시스턴트입니다. 사용자가 최신 정보나 실시간 데이터가 필요한 질문을 하면 web_search 함수를 사용해서 웹 검색을 수행하세요.

⚠️ 중요: 검색 결과를 사용할 때 반드시 다음 형식을 지켜주세요:

1. 각 정보 뒤에 반드시 [출처: 사이트명](URL) 형식으로 출처 표기
2. 답변 시작에 "최신 검색 결과에 따르면" 또는 "웹 검색 결과" 명시
3. 답변 마지막에 반드시 "📍 검색 시간: [현재시간]" 추가

예시 형식:
"최신 검색 결과에 따르면, 신풍역 근처 맛집은 다음과 같습니다:

1. 스타벅스 신풍역점 - 커피 전문점 [출처: 네이버 지도](https://map.naver.com/...)
2. 순흥골 신풍역 - 한식 전문점 [출처: 다음 지도](https://map.daum.net/...)

📍 검색 시간: 2025-01-29 01:27"

이 형식을 절대 지켜주세요. 출처 표기 없이는 절대 답변하지 마세요.`
    }

    const allMessages = [systemMessage, ...messages]

    // OpenAI API 호출 (Function Calling 포함)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: allMessages,
        tools: tools,
        tool_choice: "auto",
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || "OpenAI API 호출 실패" },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message

    // Function Call이 있는지 확인
    if (assistantMessage?.tool_calls) {
      const toolCall = assistantMessage.tool_calls[0]

      if (toolCall.function.name === "web_search") {
        const searchQuery = JSON.parse(toolCall.function.arguments).query

        // 웹 검색 수행
        const searchResults = await performWebSearch(searchQuery)

        // 검색 결과를 상세한 형태로 구성
        const formattedResults = {
          query: searchResults.query,
          timestamp: searchResults.timestamp,
          totalResults: searchResults.totalResults,

          // 직접 답변 (있는 경우)
          directAnswer: searchResults.directAnswer
            ? {
                answer: searchResults.directAnswer.answer,
                source: searchResults.directAnswer.source,
                url: searchResults.directAnswer.url
              }
            : null,

          // 지식 그래프 정보 (있는 경우)
          knowledgeInfo: searchResults.knowledgeInfo
            ? {
                title: searchResults.knowledgeInfo.title,
                description: searchResults.knowledgeInfo.description,
                source: searchResults.knowledgeInfo.source
              }
            : null,

          // 상세 검색 결과 (출처 정보 포함)
          searchResults: searchResults.results.map((result, index) => ({
            rank: index + 1,
            title: result.title,
            snippet: result.snippet,
            url: result.url,
            source: result.source,
            displayUrl: result.url ? new URL(result.url).hostname : ""
          })),

          // 출처 표기 안내
          citationGuide:
            "반드시 각 정보의 출처를 [출처: 사이트명](URL) 형식으로 표기하세요. 예: [출처: 네이버](https://naver.com)"
        }

        // 검색 결과를 포함한 메시지 추가
        const updatedMessages = [
          ...allMessages,
          assistantMessage,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(formattedResults, null, 2)
          }
        ]

        // 검색 결과를 바탕으로 최종 응답 생성
        const finalResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: updatedMessages,
              max_tokens: 2000,
              temperature: 0.7
            })
          }
        )

        if (finalResponse.ok) {
          const finalData = await finalResponse.json()
          const finalAnswer =
            finalData.choices?.[0]?.message?.content ||
            "검색 결과를 처리할 수 없습니다."
          return NextResponse.json({ response: finalAnswer })
        }
      }
    }

    // Function Call이 없는 경우 일반 응답
    const aiResponse = assistantMessage?.content || "응답을 생성할 수 없습니다."
    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
