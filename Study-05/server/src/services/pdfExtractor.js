const { AppError } = require("../utils/errors");

const MAX_TEXT_LENGTH = 60000; // PRD 4.2 — 60,000자 초과 시 truncate

// pdfjs-dist(6.x)는 ESM 전용 패키지라 CommonJS인 이 프로젝트에서는 동적 import()로 불러온다.
// (참고: 최초 pdf-parse@1.1.1을 사용했으나, 이 패키지가 번들한 pdf.js가 2016년 버전(v1.10.100)으로
// 오래되어 Express 요청 핸들러 컨텍스트에서 정상적인 PDF도 "bad XRef entry" 오류로 간헐적으로 파싱에
// 실패하는 것이 실측으로 확인되어(standalone 스크립트에서는 같은 파일이 항상 성공) 적극적으로 유지보수되는
// Mozilla 공식 pdfjs-dist로 교체했다.)
let pdfjsLibPromise = null;
function loadPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return pdfjsLibPromise;
}

/**
 * PDF 버퍼에서 텍스트를 추출한다.
 * @param {Buffer} buffer - multer memoryStorage로 받은 업로드 파일 버퍼
 * @returns {Promise<{ text: string, pageCount: number, extractedTextLength: number, truncated: boolean }>}
 * @throws {AppError} EXTRACTION_FAILED - PDF 파싱 자체가 실패한 경우 (손상된 파일 등)
 * @throws {AppError} EXTRACTION_EMPTY - 추출된 텍스트가 비어있는 경우 (이미지 스캔본 등)
 */
async function extractTextFromPdf(buffer) {
  const pdfjsLib = await loadPdfjs();

  let doc;
  let rawText;
  let pageCount;
  try {
    // new Uint8Array(buffer)는 원본이 TypedArray일 때 값 단위로 복사한다(버퍼 공유 X).
    // multer 버퍼의 byteOffset이 0이 아닌 경우에도 항상 안전한 독립 사본이 된다.
    const data = new Uint8Array(buffer);
    // 로컬 1인 사용 도구이므로 워커 스레드 없이(disableWorker) 메인 스레드에서 바로 파싱한다.
    doc = await pdfjsLib.getDocument({ data, disableWorker: true, useWorkerFetch: false }).promise;
    pageCount = doc.numPages;

    let text = "";
    for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      text += (text ? "\n" : "") + pageText;
    }
    rawText = text.trim();
  } catch (err) {
    throw new AppError("EXTRACTION_FAILED");
  } finally {
    if (doc && typeof doc.destroy === "function") {
      await doc.destroy().catch(() => {});
    }
  }

  if (rawText.length === 0) {
    throw new AppError("EXTRACTION_EMPTY");
  }

  const truncated = rawText.length > MAX_TEXT_LENGTH;
  const text = truncated ? rawText.slice(0, MAX_TEXT_LENGTH) : rawText;

  return {
    text,
    pageCount,
    extractedTextLength: text.length,
    truncated,
  };
}

module.exports = { extractTextFromPdf, MAX_TEXT_LENGTH };
