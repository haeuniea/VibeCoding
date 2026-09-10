const express = require("express");
const { handleSingleUpload } = require("../middleware/upload");
const { extractTextFromPdf } = require("../services/pdfExtractor");
const { summarizeText } = require("../services/summarizer");
const { AppError } = require("../utils/errors");

const router = express.Router();

// POST /api/summarize — PDF 업로드 → 텍스트 추출 → AI 요약 (PRD 5.1)
router.post("/summarize", handleSingleUpload("pdf"), async (req, res, next) => {
  const startedAt = Date.now();
  try {
    if (!req.file) {
      throw new AppError("NO_FILE");
    }

    const { buffer, originalname, size } = req.file;
    const extraction = await extractTextFromPdf(buffer);

    const summaryResult = await summarizeText(extraction.text, {
      fileName: originalname,
      pageCount: extraction.pageCount,
      truncated: extraction.truncated,
    });

    const tookMs = Date.now() - startedAt;

    res.status(200).json({
      success: true,
      data: {
        fileName: originalname,
        fileSizeBytes: size,
        pageCount: extraction.pageCount,
        extractedTextLength: extraction.extractedTextLength,
        truncated: extraction.truncated,
        summary: summaryResult.summary,
        model: summaryResult.model,
        tookMs,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
