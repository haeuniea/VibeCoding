# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 상태

Study-05에는 독립된 웹앱 2개가 있다. 둘 다 OpenRouter 무료 모델을 사용하며, 빌드 도구 없는 정적 HTML/JS로 작성되어 브라우저에서 바로 열 수 있다.

1. **AI 공감 다이어리** (`index.html`) — 한 줄 일기를 입력하면 감정을 분석하고 공감 메시지를 생성. 완전 클라이언트 단일 파일, OpenRouter를 브라우저에서 직접 호출.
2. **PDF 요약 웹앱** (`index_pdf.html` + `server/`) — PDF를 업로드하면 텍스트를 추출해 AI가 요약. 프론트(정적 단일 파일) + 로컬 Node.js 서버 구조.

`.env`(git 미추적)에 `OPENROUTER_API_KEY`가 정의되어 있고, 두 앱 모두 이 키로 OpenRouter API를 호출한다.

## 1. AI 공감 다이어리 (`index.html`)

### 아키텍처
- 완전 클라이언트 단일 HTML 파일. 서버 없이 더블클릭으로 실행.
- `analyzeDiaryEntry(text, apiKey)`가 브라우저에서 직접 `https://openrouter.ai/api/v1/chat/completions`를 호출한다 (`index.html:397` 부근).
- 모델: `nex-agi/nex-n2.5-pro:free` (`index.html:383`).
- 기록은 `localStorage`에 저장.

### 실행 방법
`index.html`을 브라우저로 연다. 단, **커밋된 파일에는 API 키가 빈 문자열로 되어 있다** (`index.html:380`, git 히스토리에 시크릿이 남지 않도록 의도적으로 비워둠). 로컬에서 실행하려면 `.env`의 `OPENROUTER_API_KEY` 값을 `index.html:380`의 `OPENROUTER_API_KEY = ""`에 붙여넣어야 한다. **이 상태로 커밋하지 말 것.**

### 빌드/테스트
빌드 과정 없음. 별도 테스트 프레임워크 없음(개발 중 Node 스모크 테스트와 jsdom 테스트로 수동 검증됨, 저장소에 테스트 파일로 남아있지 않음).

## 2. PDF 요약 웹앱 (`index_pdf.html` + `server/`)

### 아키텍처
API 키를 안전하게 지키기 위해 **로컬 서버 + 정적 프론트엔드** 구조를 사용한다 (완전 클라이언트 방식과 달리 키가 브라우저에 노출되지 않음):

- **프론트엔드** `index_pdf.html` — 드래그&드롭 업로드 UI, 로딩/에러/재시도 처리, 한글 인터페이스. `http://localhost:3000`의 API를 `fetch`로 호출만 함. API 키를 전혀 포함하지 않음.
- **백엔드** `server/` (Express) — PDF 업로드 검증 → `pdfjs-dist`로 텍스트 추출 → OpenRouter로 요약. `.env`(server 폴더 상위, `Study-05/.env`)에서 `OPENROUTER_API_KEY`를 읽어 서버에서만 사용.

**중요: `index_pdf.html`을 열기 전에 반드시 서버를 먼저 실행해야 한다.** 서버가 꺼진 상태로 열면 페이지 로드 시 `/api/health` 확인이 실패해 안내 배너가 표시된다.

### 디렉터리 구조
```
server/
├── src/
│   ├── index.js              # 엔트리 — dotenv 로드(../.env), 서버 기동(기본 포트 3000)
│   ├── app.js                 # Express 앱 — CORS(file:// 및 localhost만 허용), 라우팅
│   ├── routes/
│   │   ├── health.js          # GET /api/health
│   │   └── summarize.js       # POST /api/summarize (업로드 → 추출 → 요약 파이프라인)
│   ├── middleware/
│   │   ├── upload.js          # multer(memoryStorage), PDF만/10MB/1개 검증, multer 에러 → AppError 변환
│   │   └── errorHandler.js    # 공통 에러 응답 포맷터
│   ├── services/
│   │   ├── pdfExtractor.js    # pdfjs-dist로 PDF → 텍스트 추출 (60,000자 초과 시 truncate)
│   │   └── summarizer.js      # OpenRouter Chat Completions 호출, 모델: nex-agi/nex-n2.5-pro:free
│   └── utils/
│       └── errors.js          # AppError 클래스 + 에러 코드/HTTP status/한국어 메시지 매핑
└── package.json
```

### 컴포넌트 연결 흐름
```
index_pdf.html (브라우저)
  → GET  /api/health          서버 연결 확인
  → POST /api/summarize       (multipart, 필드명 "pdf")
       upload.js  (파일 검증: PDF만, ≤10MB, 1개)
       → pdfExtractor.js  (텍스트 추출, 60,000자 초과 시 truncate)
       → summarizer.js    (OpenRouter 호출, 실패 시 AppError throw)
       → routes/summarize.js가 응답 조립
  ← { success, data: { fileName, fileSizeBytes, pageCount, extractedTextLength,
                        truncated, summary, model, tookMs } }
  ← 실패 시 { success: false, error: { code, message } }
```
에러 코드: `NO_FILE`, `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `EXTRACTION_FAILED`, `EXTRACTION_EMPTY`, `OPENROUTER_AUTH_ERROR`, `OPENROUTER_RATE_LIMITED`, `OPENROUTER_TIMEOUT`, `OPENROUTER_ERROR`, `INTERNAL_ERROR` (상세는 `PRD.md` 5장, `server/src/utils/errors.js` 참고).

### 실행 방법
```bash
cd server
npm install       # 최초 1회
npm start         # 포트 3000, ../.env의 OPENROUTER_API_KEY 로드
# 개발 중 자동 재시작: npm run dev
```
서버가 켜진 상태에서 `index_pdf.html`을 브라우저로 연다.

### 빌드/테스트
빌드 과정 없음(둘 다 순수 JS, 트랜스파일 불필요). 자동화된 테스트 스위트는 없음 — qa-engineer가 실제 서버 기동 + curl/Playwright로 정상/에러/경계값/보안 시나리오를 수동 검증했다 (내역은 `PRD.md` 및 PR #4 참고).

### 보안 메모
- `OPENROUTER_API_KEY`는 서버(`server/src/index.js`, `summarizer.js`)에서만 읽으며 값 자체를 로그에 출력하지 않는다.
- 업로드 파일은 `multer.memoryStorage()`만 사용해 디스크에 저장되지 않는다.
- CORS는 `file://`(origin null)과 `localhost`/`127.0.0.1`만 허용한다 (`app.js`의 `corsOriginCheck`).

## 참고 문서
- `PRD.md` — PDF 요약 웹앱의 상세 요구사항/API 명세/모델 선정 기준.
- `.claude/agents/` — 이 프로젝트에서 사용한 서브에이전트 정의(product-manager, backend-developer, ai-integration-specialist, frontend-developer, qa-engineer).

## 공통 규칙

커밋/브랜치/PR 규칙은 모노레포 루트의 `../CLAUDE.md`를 따른다.
