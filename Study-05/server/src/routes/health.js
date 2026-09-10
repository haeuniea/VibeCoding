const express = require("express");

const router = express.Router();

// GET /api/health — 프론트엔드가 로컬 서버 실행 여부를 확인하기 위한 헬스체크 (PRD 5.2)
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

module.exports = router;
