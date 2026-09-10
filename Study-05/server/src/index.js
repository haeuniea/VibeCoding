const path = require("path");
const dotenv = require("dotenv");

// .env는 Study-05/ 루트에 위치한다 (server/ 바로 위, git 미추적).
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const { createApp } = require("./app");

const PORT = process.env.PORT || 3000;

// 키가 로드되었는지 여부만 확인한다. 값 자체는 절대 로그에 남기지 않는다.
if (process.env.OPENROUTER_API_KEY) {
  console.log("[env] OPENROUTER_API_KEY 로드됨");
} else {
  console.warn(
    "[env] OPENROUTER_API_KEY가 설정되지 않았습니다. Study-05/.env 파일을 확인해주세요. " +
      "(AI 요약 요청 시 OPENROUTER_AUTH_ERROR로 실패합니다.)"
  );
}

const app = createApp();

app.listen(PORT, () => {
  console.log(`PDF 요약 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
