const { AppError } = require("../utils/errors");

/**
 * OpenRouter 요약 서비스 구현.
 *
 * 모델 선정 근거 (2026-09-10 실측, ai-integration-specialist):
 * - PRD 6장 1순위 후보 `google/gemma-4-31b-it:free`는 실제 호출 시 4회 연속
 *   "temporarily rate-limited upstream"(429, Google AI Studio 공유 무료 풀 한도)로
 *   응답을 받지 못했다. 일시적 현상이 아니라 짧은 시간 내 반복 재현되어 신뢰할 수 없다고 판단.
 * - PRD 6장 2순위 후보 `nex-agi/nex-n2.5-pro:free`는 짧은 텍스트(1.3초)와
 *   긴 텍스트(약 55,000자/25,000토큰, 2.8초, cost: 0) 모두에서 정상 응답했고,
 *   한국어 불릿 요약 품질도 사실 충실도 높게 나왔다. 이 저장소의 기존 index.html에서
 *   이미 검증되어 사용 중인 모델이라는 점도 신뢰도를 높인다.
 * - 결론: 이 프로젝트는 1인 개인용 로컬 도구이고 무료 모델 한정이라는 제약(PRD 3.2) 때문에
 *   자동 모델 전환 로직은 두지 않고(과도한 엔지니어링 지양), 실측으로 더 안정적인
 *   `nex-agi/nex-n2.5-pro:free`를 단일 모델로 고정한다. 향후 이 모델도 지속적으로
 *   실패한다면 아래 MODEL 상수만 교체하면 된다(주석의 1순위 후보로 되돌리기 등).
 * - cost/latency: 두 모델 모두 무료($0)이므로 비용 트레이드오프는 없음. 지연시간은
 *   짧은 입력 기준 1~3초로 PRD 8.2의 60초 목표 대비 여유가 크다. 긴 입력(6만자 근접)에서도
 *   수 초 내 응답해 PRD가 우려한 "무료 모델 응답 지연 10~40초" 수준까지 가지 않았다(실측 기준).
 */
const MODEL = "nex-agi/nex-n2.5-pro:free";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// PRD 4.3 — 요청 타임아웃 60초. 라우트 응답까지의 여유를 조금 남기기 위해 55초로 설정.
const TIMEOUT_MS = 55000;

const SYSTEM_PROMPT = [
  "당신은 업로드된 문서를 한국어로 간결하고 정확하게 요약하는 전문 AI 어시스턴트입니다.",
  "다음 규칙을 반드시 지키세요.",
  "1. 요약은 반드시 한국어(한글)로만 작성합니다. 원문이 영어 등 다른 언어여도 결과는 한국어여야 하며, 중국어 한자나 일본어 문자를 단 한 글자도 섞지 않습니다.",
  "2. 문서의 핵심 내용을 3~5개의 불릿 포인트로 작성합니다. 각 줄은 '-'로 시작합니다.",
  "3. 각 불릿은 한두 문장으로, 사실에 기반해 간결하게 작성합니다.",
  "4. '이 문서는~', '요약하면~' 같은 서론이나 메타 설명 없이 핵심 내용만 바로 나열합니다.",
  "5. 원문에 없는 내용을 추측하거나 지어내지 않습니다.",
  "6. 마크다운 코드블록(```)이나 추가 설명 없이 불릿 목록만 출력합니다.",
].join("\n");

function buildUserPrompt(extractedText, meta) {
  const note = meta.truncated
    ? "\n\n[참고: 이 텍스트는 문서 앞부분 일부만 발췌된 것입니다. 주어진 내용만으로 요약하세요.]"
    : "";
  return `다음 문서를 요약해주세요:\n\n${extractedText}${note}`;
}

/**
 * OpenRouter Chat Completions API로 텍스트를 요약한다.
 * @param {string} extractedText - PDF에서 추출된 텍스트 (이미 최대 60,000자로 truncate됨)
 * @param {{ fileName?: string, pageCount?: number, truncated?: boolean }} meta
 * @returns {Promise<{ summary: string, model: string, tookMs: number }>}
 * @throws {AppError} OPENROUTER_AUTH_ERROR | OPENROUTER_RATE_LIMITED | OPENROUTER_TIMEOUT | OPENROUTER_ERROR
 */
async function summarizeText(extractedText, meta = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    // 서버 설정 문제(키 미설정)이지 사용자 입력 문제가 아니므로 AUTH_ERROR로 매핑한다.
    // 메시지는 errors.js의 기본 한국어 메시지를 그대로 사용하고, 원인은 서버 콘솔에만 남긴다.
    console.error("[summarizer] OPENROUTER_API_KEY가 설정되지 않았습니다.");
    throw new AppError("OPENROUTER_AUTH_ERROR");
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://study-05.local",
        "X-Title": "Study-05 PDF Summarizer",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(extractedText, meta) },
        ],
        // 요약은 창의성보다 사실 충실도가 중요하므로 낮은 temperature 사용 (PRD 6장 가이드).
        temperature: 0.4,
        max_tokens: 700,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err && err.name === "AbortError") {
      throw new AppError("OPENROUTER_TIMEOUT");
    }
    // 네트워크 단절 등. 키 값이 노출되지 않도록 err 객체 자체를 그대로 로그하지 않는다.
    console.error("[summarizer] OpenRouter 요청 실패(네트워크):", err && err.message);
    throw new AppError("OPENROUTER_ERROR");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch (err) {
      // 무시 - 에러 본문을 못 읽어도 status로 매핑을 진행한다.
    }
    console.error(`[summarizer] OpenRouter 오류 응답 status=${response.status} body=${bodyText.slice(0, 300)}`);

    if (response.status === 401 || response.status === 403) {
      throw new AppError("OPENROUTER_AUTH_ERROR");
    }
    if (response.status === 429) {
      throw new AppError("OPENROUTER_RATE_LIMITED");
    }
    throw new AppError("OPENROUTER_ERROR");
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new AppError("OPENROUTER_ERROR", "AI 응답을 해석할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new AppError("OPENROUTER_ERROR", "AI로부터 요약 결과를 받지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  return {
    summary: content.trim(),
    model: MODEL,
    tookMs: Date.now() - startedAt,
  };
}

module.exports = { summarizeText, MODEL };
