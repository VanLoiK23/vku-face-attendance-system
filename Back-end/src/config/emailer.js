const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "loihv.23ite@vku.udn.vn",
      pass: "uebcklvodqkwdtkv"
    }
  });

module.exports = transporter