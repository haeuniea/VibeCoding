/**
 * 공통 에러 코드 정의 (PRD 5장 참고)
 * 각 코드에 매핑되는 HTTP status와 사용자용 한국어 메시지 기본값을 관리한다.
 * OpenRouter 관련 코드(OPENROUTER_*)는 ai-integration-specialist 단계에서 사용될 자리만 미리 정의해둔다.
 */
const ERROR_DEFS = {
  NO_FILE: { status: 400, message: "PDF 파일을 첨부해주세요." },
  INVALID_FILE_TYPE: { status: 400, message: "PDF 파일만 업로드할 수 있습니다." },
  FILE_TOO_LARGE: { status: 413, message: "파일 크기는 10MB를 초과할 수 없습니다." },
  EXTRACTION_FAILED: { status: 422, message: "PDF 파일을 읽는 중 오류가 발생했습니다. 파일이 손상되지 않았는지 확인해주세요." },
  EXTRACTION_EMPTY: { status: 422, message: "이 PDF에서는 텍스트를 추출할 수 없습니다 (이미지 스캔본일 수 있음)." },
  // 아래 4개는 ai-integration-specialist 단계에서 실제로 발생시킬 코드. 현재는 정의만 해둔다.
  OPENROUTER_AUTH_ERROR: { status: 502, message: "AI 요약 서비스 인증에 실패했습니다. 잠시 후 다시 시도해주세요." },
  OPENROUTER_RATE_LIMITED: { status: 429, message: "AI 요약 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
  OPENROUTER_TIMEOUT: { status: 504, message: "AI 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요." },
  OPENROUTER_ERROR: { status: 502, message: "AI 요약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
  INTERNAL_ERROR: { status: 500, message: "서버에서 알 수 없는 오류가 발생했습니다." },
};

class AppError extends Error {
  /**
   * @param {keyof typeof ERROR_DEFS} code
   * @param {string} [message] - 기본 메시지를 덮어쓰고 싶을 때
   * @param {number} [status] - 기본 status를 덮어쓰고 싶을 때
   */
  constructor(code, message, status) {
    const def = ERROR_DEFS[code] || ERROR_DEFS.INTERNAL_ERROR;
    super(message || def.message);
    this.name = "AppError";
    this.code = code in ERROR_DEFS ? code : "INTERNAL_ERROR";
    this.status = status || def.status;
  }
}

function errorResponseBody(err) {
  if (err instanceof AppError) {
    return { success: false, error: { code: err.code, message: err.message } };
  }
  return {
    success: false,
    error: { code: "INTERNAL_ERROR", message: ERROR_DEFS.INTERNAL_ERROR.message },
  };
}

module.exports = { AppError, ERROR_DEFS, errorResponseBody };
