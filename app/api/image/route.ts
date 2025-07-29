import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, conversationHistory } = await request.json()

    if (!prompt || !apiKey) {
      return NextResponse.json(
        { error: "Prompt and API key are required" },
        { status: 400 }
      )
    }

    // 대화 히스토리를 바탕으로 맥락 정보 추출
    let contextInfo = ""
    if (conversationHistory && conversationHistory.length > 0) {
      // 최근 5개 메시지에서 맥락 추출
      const recentMessages = conversationHistory.slice(-5)
      contextInfo = recentMessages
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join("\n")

      console.log("대화 히스토리 맥락:", contextInfo)
    }

    // 한국어 프롬프트를 영어로 번역 및 최적화
    let optimizedPrompt = prompt

    // 한국어가 포함된 경우 영어로 번역
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(prompt)) {
      // GPT를 사용해서 한국어를 영어로 번역하고 DALL-E에 최적화
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
                  "You are a professional translator and DALL-E prompt optimizer. Translate Korean text to English and optimize it for DALL-E image generation. Make the prompt detailed, vivid, and artistic. Include style, mood, lighting, and composition details. Use the conversation context to enhance the prompt with relevant details."
              },
              {
                role: "user",
                content: `Translate and optimize this Korean prompt for DALL-E: "${prompt}"${contextInfo ? `\n\nConversation context for reference:\n${contextInfo}` : ""}`
              }
            ],
            max_tokens: 200,
            temperature: 0.7
          })
        }
      )

      if (translationResponse.ok) {
        const translationData = await translationResponse.json()
        optimizedPrompt = translationData.choices[0]?.message?.content || prompt
      }
    } else {
      // 영어 프롬프트도 DALL-E에 최적화
      optimizedPrompt = `${prompt}, highly detailed, professional photography, beautiful lighting, artistic composition`
    }

    // OpenAI DALL-E API 호출
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: optimizedPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url"
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || "DALL-E API 호출 실패" },
        { status: response.status }
      )
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json(
        { error: "이미지 생성에 실패했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      imageUrl: imageUrl,
      prompt: prompt,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Image generation error:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
