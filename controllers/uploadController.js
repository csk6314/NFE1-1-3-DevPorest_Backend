const fileHandler = require("../utils/fileHandler");

class UploadController {
  // 단일 이미지 업로드 처리
  async uploadSingleImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "이미지 파일이 없습니다.",
        });
      }

      const imageUrl = await fileHandler.uploadFileToS3(req.file, req.userinfo);

      res.status(200).json({
        success: true,
        data: {
          url: imageUrl,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "이미지 업로드에 실패했습니다.",
      });
    }
  }

  // 다중 이미지 업로드 처리
  async uploadMultipleImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "이미지 파일이 없습니다.",
        });
      }

      const imageUrls = await fileHandler.uploadMultipleFilesToS3(
        req.files,
        req.userinfo
      );

      res.status(200).json({
        success: true,
        data: {
          urls: imageUrls,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "이미지 업로드에 실패했습니다.",
      });
    }
  }
}

module.exports = new UploadController();
