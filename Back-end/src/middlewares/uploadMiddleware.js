// ================================
// middlewares/uploadVideo.js
// ================================

const multer = require("multer");

const storage = multer.memoryStorage();

const uploadVideo = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép upload video"), false);
    }
  },
});

module.exports = uploadVideo;
