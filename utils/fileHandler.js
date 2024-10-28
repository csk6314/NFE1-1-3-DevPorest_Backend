const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

// S3 클라이언트 초기화
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

class FileHandler {
  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET;
  }

  // 단일 파일을 S3에 업로드하고 URL 반환
  async uploadFileToS3(file, userinfo) {
    try {
      if (!userinfo || !userinfo.id) {
        throw new Error("사용자 정보가 필요합니다.");
      }

      const fileStream = fs.createReadStream(file.path);
      const uploadParams = {
        Bucket: this.bucket,
        Key: `${userinfo.id}/${Date.now()}-${file.filename}`,
        Body: fileStream,
        ContentType: file.mimetype,
        // ACL: "public-read",
      };

      const result = await s3.upload(uploadParams).promise();

      // 로컬 파일 삭제
      await fs.promises.unlink(file.path);

      return result.Location;
    } catch (error) {
      throw new Error(`S3 업로드 실패: ${error.message}`);
    }
  }

  // 다중 파일을 S3에 업로드하고 URL 배열 반환
  async uploadMultipleFilesToS3(files, userinfo) {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadFileToS3(file, userinfo)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`다중 파일 S3 업로드 실패: ${error.message}`);
    }
  }

  // S3에서 파일 삭제
  async deleteFileFromS3(fileUrl) {
    try {
      const key = fileUrl.split(
        `${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/`
      )[1];
      await s3
        .deleteObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();
    } catch (error) {
      throw new Error(`S3 파일 삭제 실패: ${error.message}`);
    }
  }
}

module.exports = new FileHandler();
