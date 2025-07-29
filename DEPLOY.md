# Netlify 배포 가이드

## 🚀 자동 배포 설정

### 1. GitHub 저장소 생성
```bash
git init
git add .
git commit -m "Initial commit: ChatBot UI with GPT-4o, Search, Image Generation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chatbot-ui.git
git push -u origin main
```

### 2. Netlify 배포
1. [Netlify](https://netlify.com)에 로그인
2. "New site from Git" 클릭
3. GitHub 저장소 선택
4. 빌드 설정 자동 감지 (netlify.toml 사용)
5. 환경 변수 설정 (아래 참조)
6. "Deploy site" 클릭

## 🔧 필수 환경 변수

Netlify 사이트 설정 > Environment variables에서 다음 변수들을 설정하세요:

### 필수 변수:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 선택적 변수:
```
SERPAPI_KEY=your_serpapi_key_for_web_search
```

## 🎯 기능별 API 키 안내

### 1. 기본 채팅 (GPT-4o)
- 사용자가 직접 OpenAI API 키 입력
- 별도 서버 환경 변수 불필요

### 2. 웹 검색 (SerpAPI)
- `SERPAPI_KEY` 환경 변수 설정
- 없으면 시뮬레이션 데이터 사용

### 3. 이미지 생성 (DALL-E 3)
- 사용자 OpenAI API 키 사용
- 별도 설정 불필요

### 4. 인증 (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL` 필수
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 필수

## 📱 배포 후 테스트

1. **기본 접속**: https://your-site.netlify.app
2. **API 키 입력**: OpenAI API 키로 로그인
3. **기능 테스트**:
   - 일반 채팅: "안녕하세요"
   - 웹 검색: 🌍 버튼 → "오늘 날씨"
   - 이미지 생성: "고양이 그려줘"

## 🔧 문제 해결

### API Routes 오류:
- Netlify Functions 로그 확인
- 환경 변수 설정 확인
- 10초 타임아웃 제한 고려

### 이미지 로딩 오류:
- next.config.js의 이미지 도메인 설정 확인
- DALL-E 이미지 URL 접근 권한 확인

### 빌드 오류:
- Node.js 버전 18 사용 확인
- package.json 의존성 확인
