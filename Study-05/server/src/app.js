const express = require("express");
const cors = require("cors");

const healthRouter = require("./routes/health");
const summarizeRouter = require("./routes/summarize");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

/**
 * CORS origin 검사.
 * - index_pdf.html을 file://로 더블클릭해서 열면 브라우저가 Origin 헤더를 보내지 않거나 'null'로 보낸다 → 허용.
 * - localhost/127.0.0.1에서 띄운 정적 서버(예: VSCode Live Server)도 개발 편의상 허용.
 * - 그 외 origin은 거부한다 (PRD 8.1 — 와일드카드 전체 허용 지양).
 */
function corsOriginCheck(origin, callback) {
  if (!origin || origin === "null") {
    callback(null, true);
    return;
  }
  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      callback(null, true);
      return;
    }
  } catch (err) {
    // origin이 URL로 파싱되지 않으면 거부
  }
  const corsError = new Error("CORS: 허용되지 않은 origin입니다.");
  corsError.isCorsError = true;
  callback(corsError);
}

function createApp() {
  const app = express();

  app.use(cors({ origin: corsOriginCheck }));

  app.use("/api", healthRouter);
  app.use("/api", summarizeRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
