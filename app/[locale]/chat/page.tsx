"use client"

import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  IconSend,
  IconUser,
  IconRobot,
  IconKey,
  IconLogout,
  IconSearch,
  IconWorld
} from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function ChatPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [isSearchMode, setIsSearchMode] = useState(false)

  useEffect(() => {
    // API 키 확인
    const storedApiKey = localStorage.getItem("openai_api_key")
    if (!storedApiKey) {
      router.push("/")
      return
    }
    setApiKey(storedApiKey)

    // 환영 메시지
    setMessages([
      {
        id: "welcome",
        content:
          "안녕하세요! API 키로 인증되었습니다. GPT-4o 모델을 사용하여 도와드리겠습니다. 무엇을 도와드릴까요?",
        role: "assistant",
        timestamp: new Date()
      }
    ])
  }, [router])

  const handleSearchMessage = async () => {
    if (!inputValue.trim()) return

    // "그려줘" 키워드 감지 후 이미지 생성 기능 호출
    if (/그려줘|그려|그림|이미지/i.test(inputValue)) {
      await handleImageGeneration()
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // 대화 히스토리 준비 (시스템 메시지 제외)
      const conversationHistory = messages
        .filter(msg => msg.id !== "welcome")
        .map(msg => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content
        }))

      // 현재 사용자 메시지 추가
      conversationHistory.push({
        role: "user",
        content: inputValue
      })

      // 검색 API 호출
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: conversationHistory,
          apiKey: apiKey
        })
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            data.response || "죄송합니다. 검색 결과를 가져올 수 없습니다.",
          role: "assistant",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error("검색 API 호출 실패")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "죄송합니다. 현재 검색 기능에 문제가 있습니다. API 키를 확인해주세요.",
        role: "assistant",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleImageGeneration = async () => {
    if (!inputValue.trim()) return

    // "그려줘" 키워드 제거하고 실제 프롬프트 추출
    let prompt = inputValue.replace(/그려줘|그려|그림|이미지/gi, "").trim()

    // 대화 맥락을 분석해서 프롬프트 보강
    if (messages.length > 0) {
      // 최근 3개 메시지에서 맥락 추출
      const recentMessages = messages.slice(-3)
      const contextInfo = recentMessages
        .filter(msg => msg.role === "user" || msg.role === "assistant")
        .map(msg => msg.content)
        .join(" ")

      // 맥락에서 관련 키워드 추출 (색상, 스타일, 객체 등)
      const contextKeywords = contextInfo.match(
        /\b(빨간|파란|노란|초록|검은|흰|큰|작은|귀여운|아름다운|현대적인|클래식한|미래적인|자연|도시|바다|산|하늘|동물|사람|건물|꽃|나무)\b/g
      )

      if (contextKeywords && contextKeywords.length > 0) {
        // 중복 제거 후 맥락 정보 추가
        const uniqueKeywords = [...new Set(contextKeywords)]
        prompt = `${prompt}, ${uniqueKeywords.join(", ")} 스타일로`
      }

      // 이전 대화에서 구체적인 설명이 있었다면 포함
      const detailedContext = recentMessages
        .filter(msg => msg.content.length > 20 && !msg.content.includes("그려"))
        .slice(-1)[0]?.content

      if (detailedContext && detailedContext.length < 100) {
        prompt = `${prompt}, ${detailedContext}의 분위기로`
      }
    }

    if (
      !prompt ||
      prompt.replace(/,\s*(스타일로|의\s*분위기로)/g, "").trim() === ""
    ) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "무엇을 그려드릴까요? 예: '고양이 그려줘', '바다 풍경 그려줘'",
        role: "assistant",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // 이미지 생성 API 호출
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          apiKey: apiKey
        })
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `"${prompt}"에 대한 이미지를 생성했습니다:\n\n![생성된 이미지](${data.imageUrl})\n\n🎨 생성 시간: ${new Date().toLocaleString("ko-KR")}`,
          role: "assistant",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error("이미지 생성 API 호출 실패")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "죄송합니다. 이미지 생성 중 오류가 발생했습니다. API 키를 확인해주세요.",
        role: "assistant",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // "그려줘" 키워드 감지 후 이미지 생성 기능 호출
    if (/그려줘|그려|그림|이미지/i.test(inputValue)) {
      await handleImageGeneration()
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // 대화 히스토리 준비 (시스템 메시지 제외)
      const conversationHistory = messages
        .filter(msg => msg.id !== "welcome")
        .map(msg => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content
        }))

      // 현재 사용자 메시지 추가
      conversationHistory.push({
        role: "user",
        content: inputValue
      })

      // OpenAI API 호출
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: conversationHistory,
          apiKey: apiKey
        })
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response || "죄송합니다. 응답을 생성할 수 없습니다.",
          role: "assistant",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error("API 호출 실패")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "죄송합니다. 현재 API 연결에 문제가 있습니다. API 키를 확인해주세요.",
        role: "assistant",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("openai_api_key")
    router.push("/")
  }

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChatbotUISVG
              theme={theme === "dark" ? "dark" : "light"}
              scale={0.1}
            />
            <div>
              <h1 className="text-xl font-bold">Chatbot UI</h1>
              <p className="text-sm text-gray-600">GPT-4o 모델 사용 중</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-green-600">
              <IconKey size={14} />
              API 연결됨
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <IconLogout size={14} />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[80%] gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  {message.role === "user" ? (
                    <IconUser size={16} />
                  ) : (
                    <IconRobot size={16} />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                <IconRobot size={16} />
              </div>
              <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <div className="flex gap-1">
                  <div className="size-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div
                    className="size-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="size-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="mx-auto max-w-2xl">
          <div className="relative flex items-center rounded-full bg-gray-100 px-4 py-3 shadow-sm dark:bg-gray-800">
            {/* 지구본 토글 버튼 */}
            <Button
              onClick={() => setIsSearchMode(!isSearchMode)}
              size="sm"
              variant="ghost"
              title={isSearchMode ? "검색 모드 끄기" : "검색 모드 켜기"}
              className={`mr-3 size-8 shrink-0 rounded-full p-0 transition-colors${
                isSearchMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <IconWorld className="size-4" />
            </Button>

            {/* 입력창 */}
            <Input
              type="text"
              placeholder={
                isSearchMode
                  ? "웹 검색할 내용을 입력하세요..."
                  : "메시지를 입력하세요..."
              }
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (isSearchMode) {
                    handleSearchMessage()
                  } else {
                    handleSendMessage()
                  }
                }
              }}
              disabled={isLoading}
              className="flex-1 border-0 bg-transparent px-0 focus:outline-none focus:ring-0"
            />

            {/* 전송 버튼 */}
            <Button
              onClick={isSearchMode ? handleSearchMessage : handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
              title={isSearchMode ? "웹 검색" : "메시지 전송"}
              className="ml-3 size-8 rounded-full bg-blue-600 p-0 text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isSearchMode ? (
                <IconSearch className="size-4" />
              ) : (
                <IconSend className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
