const cloudinary = require("../config/cloudinary");
const Student = require("../models/student");

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "vku_face_attendance",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(buffer);
  });
};

const uploadFaceVideoService = async ({ file, userId }) => {
  if (!file) {
    const error = new Error("Không tìm thấy video");
    error.status = 400;
    throw error;
  }

  // validate size
  if (file.size > 20 * 1024 * 1024) {
    const error = new Error("Video phải nhỏ hơn 20MB");
    error.status = 400;
    throw error;
  }

  const student = await Student.findOne({
    where: {
      user_id: userId,
    },
  });

  if (!student) {
    const error = new Error("Không tìm thấy sinh viên");
    error.status = 404;
    throw error;
  }

  // XÓA VIDEO CŨ
  if (student.faceVideoPublicId) {
    try {
      await cloudinary.uploader.destroy(student.faceVideoPublicId, {
        resource_type: "video",
      });
    } catch (err) {
      console.log("Delete old video failed:", err.message);
    }
  }

  // upload new video
  const uploadedVideo = await streamUpload(file.buffer);

  student.faceVideoUrl = uploadedVideo.secure_url;

  student.faceVideoPublicId = uploadedVideo.public_id;

  student.faceStatus = "pending";

  student.rejectReason = null;

  student.uploadedAt = new Date();

  await student.save();

  return {
    videoUrl: uploadedVideo.secure_url,
    status: student.faceStatus,
    uploadedAt: student.uploadedAt,
  };
};
const getFaceVideoService = async (userId) => {
  const student = await Student.findOne({
    where: {
      user_id: userId,
    },
    attributes: ["name", "faceVideoUrl", "faceStatus", "uploadedAt"],
  });

  if (!student) {
    const error = new Error("Không tìm thấy sinh viên");
    error.status = 404;
    throw error;
  }

  return student;
};

module.exports = {
  uploadFaceVideoService,
  getFaceVideoService,
};
