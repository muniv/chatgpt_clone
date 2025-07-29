# Vercel 배포 가이드

## 🚀 Vercel 자동 배포

### 1. Vercel 연동
1. [Vercel.com](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭
4. `muniv/chatgpt_clone` 저장소 선택
5. "Deploy" 클릭

### 2. 환경 변수 설정
Vercel 프로젝트 설정 > Environment Variables에서 다음 변수들을 설정:

#### 필수 변수:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 선택적 변수:
```
SERPAPI_KEY=your_serpapi_key_for_web_search
```

### 3. 자동 배포 완료!
- GitHub에 푸시할 때마다 자동 배포
- 프로덕션 URL: `https://your-project.vercel.app`

## ✨ 완성된 기능들

### 🤖 GPT-4o 채팅
- 멀티턴 대화 지원
- API 키 기반 인증

### 🔍 웹 검색
- 🌍 토글 버튼으로 검색 모드 전환
- SerpAPI 연동 실시간 검색
- 출처 표기 및 시간 표시

### 🎨 맥락 기반 이미지 생성
- "그려줘" 키워드로 DALL-E 3 호출
- 대화 맥락 자동 분석 및 반영
- 한국어 → 영어 자동 번역 최적화

### 📱 반응형 UI
- 모바일/데스크톱 최적화
- 다크/라이트 테마 지원

## 🎯 사용 방법

1. **기본 채팅**: "안녕하세요"
2. **웹 검색**: 🌍 클릭 → "오늘 날씨"
3. **이미지 생성**: "고양이 그려줘"
4. **맥락 활용**: 
   - "빨간 꽃이 예쁘네요"
   - "강아지 그려줘" → 빨간 꽃과 함께 그려짐

## 🔧 문제 해결

### API 타임아웃:
- Vercel Functions 최대 실행 시간: 60초 (이미지 생성)
- 30초 (채팅, 검색)

### 환경 변수 오류:
- Vercel 대시보드에서 환경 변수 재확인
- 배포 후 다시 배포 트리거

완전한 멀티모달 AI 어시스턴트 완성! 🎉
