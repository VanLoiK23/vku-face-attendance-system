const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Student = sequelize.define(
  "Student",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    studentCode: {
      type: DataTypes.STRING(50),
      unique: true,
      field: "student_code",
    },

    faceStatus: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "face_status",
      validate: {
        isIn: [["confirm", "pending", "reject"]],
      },
    },

    faceVideoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "face_video_url",
    },

    rejectReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "reject_reason",
    },
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "uploaded_at",
    },
    faceVideoPublicId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "face_video_public_id",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "students",
    underscored: true,
    timestamps: false,
  },
);

module.exports = Student;
