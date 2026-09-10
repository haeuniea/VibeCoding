const multer = require("multer");
const { AppError } = require("../utils/errors");

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB (PRD 4.1)
const ALLOWED_MIME_TYPE = "application/pdf";

// 메모리 스토리지만 사용 — 디스크에 절대 파일을 남기지 않는다 (PRD 8.1 보안 요구사항)
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (file.mimetype !== ALLOWED_MIME_TYPE) {
    cb(new AppError("INVALID_FILE_TYPE"));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

/**
 * multer 에러(LIMIT_FILE_SIZE 등)를 프로젝트 공통 AppError로 변환해서 다음 에러 핸들러로 넘긴다.
 * fileFilter에서 던진 AppError도 여기로 그대로 전달된다.
 */
function handleSingleUpload(fieldName) {
  const middleware = upload.single(fieldName);
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof AppError) {
        next(err);
        return;
      }
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          next(new AppError("FILE_TOO_LARGE"));
          return;
        }
        // 필드명 불일치, 파일 개수 초과 등 그 외 multer 에러는 모두 "올바른 PDF 파일이
        // 첨부되지 않음" 문제로 보고 NO_FILE(400)로 통일한다. 원인은 서버 콘솔에만 남긴다.
        console.error(`[upload] multer 요청 오류: ${err.code}`);
        next(new AppError("NO_FILE"));
        return;
      }
      next(err);
    });
  };
}

module.exports = { handleSingleUpload, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPE };
