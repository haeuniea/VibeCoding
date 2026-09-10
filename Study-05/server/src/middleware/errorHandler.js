const { AppError, errorResponseBody } = require("../utils/errors");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err && err.isCorsError) {
    // 허용되지 않은 origin의 요청 — 의도된 차단이므로 스택 로그를 남기지 않는다 (PRD 8.1)
    res.status(403).json({
      success: false,
      error: { code: "CORS_NOT_ALLOWED", message: "허용되지 않은 요청 출처입니다." },
    });
    return;
  }

  const status = err instanceof AppError ? err.status : 500;

  if (!(err instanceof AppError)) {
    // 예상 못한 에러만 서버 콘솔에 스택을 남긴다 (API 키 등 민감정보는 애초에 이 경로로 오지 않음)
    console.error("[unhandled error]", err);
  }

  res.status(status).json(errorResponseBody(err));
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "요청한 경로를 찾을 수 없습니다." },
  });
}

module.exports = { errorHandler, notFoundHandler };
