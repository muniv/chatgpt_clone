"use client"

import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconArrowRight, IconKey } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) return

    setIsLoading(true)

    // API 키를 localStorage에 저장
    localStorage.setItem("openai_api_key", apiKey)

    // 간단한 검증 후 메인 화면으로 이동
    setTimeout(() => {
      router.push("/chat")
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApiKeySubmit()
    }
  }

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div>
        <ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3} />
      </div>

      <div className="mt-2 text-4xl font-bold">Chatbot UI</div>
      <div className="mt-2 text-gray-600 dark:text-gray-400">
        API 키를 입력하여 시작하세요
      </div>

      <div className="mt-6 w-full max-w-md space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <IconKey size={16} />
            OpenAI API Key
          </label>
          <Input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <Button
          onClick={handleApiKeySubmit}
          disabled={!apiKey.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? "시작 중..." : "채팅 시작"}
          <IconArrowRight className="ml-2" size={16} />
        </Button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-blue-500 hover:underline">
            또는 계정으로 로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
