const express = require("express");
const router = express.Router();
const uploadVideo = require("../middlewares/uploadMiddleware");
const faceController = require("../controllers/student/UploadVideoController");
const {
  login,
  register,
  forgot_password,
  reset_password,
} = require("../controllers/authController");
const {
  getAllUser,
  getAllStudent,
  getAllTeacher,
  createNewAccount,
  updateAccount,
  deleteAccount,
  changePassword,
  updateProfile,
} = require("../controllers/admin/userController");
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/admin/subjectController");
const {
  getClassSection,
  createClassSection,
  updateClassSection,
  deleteClassSection,
} = require("../controllers/admin/classSectionController");
const cohortController = require("../controllers/admin/cohortController");
const {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/admin/scheduleController");

const {
  getTeacherSections,
  getTeacherDetailSection,
  getTeacherDetailSessions,
} = require("../controllers/teacher/classSectionController");

// const {auth,authIsAdmin} = require('../middlewares/auth')

const authMiddleware = require("../middlewares/authMiddleware");
const {
  getDashboard,
} = require("../controllers/student/studentDashboardController");

const enrollmentController = require("../controllers/admin/enrollmentController");
const semesterController = require("../controllers/admin/semesterController");
const {
  getMyAttendance,
} = require("../controllers/student/studentAttendanceController");
const {
  getWeekSchedule,
} = require("../controllers/student/WeeklyScheduleController");
const {
  getTodaySchedule,
} = require("../controllers/student/ScheduleTodayController");

//apply middleware for all
// router.use([auth]);

//auth
router.post("/auth/reset-password", reset_password);
router.post("/auth/forgot-password", forgot_password);
router.post("/auth/register", register);
router.post("/auth/login", login);

//subjects
router.get("/subjects", getSubjects);
router.post("/subjects", createSubject);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);

//Class sections
router.get("/class-sections", getClassSection);
router.post("/class-sections", createClassSection);
router.put("/class-sections/:id", updateClassSection);
router.delete("/class-sections/:id", deleteClassSection);

//Enrollment
router.post("/enrollments", enrollmentController.enrollStudent);
router.delete("/enrollments", enrollmentController.removeStudent);

//Cohort
router.get("/cohorts", cohortController.getAll);
router.post("/cohorts", cohortController.create);
router.put("/cohorts/:id", cohortController.update);
router.delete("/cohorts/:id", cohortController.delete);

router.get("/cohorts/:id/students", cohortController.getStudents);
router.post("/cohorts/:cohortId/students", cohortController.assignStudents);
router.delete(
  "/cohorts/:cohortId/students/:sid",
  cohortController.removeStudent,
);

// Schedule Management
router.get("/schedules", getAllSchedules);
router.post("/schedules", createSchedule);
router.put("/schedules/:id", updateSchedule);
router.delete("/schedules/:id", deleteSchedule);

// Semester
router.get("/semesters", semesterController.getAllSemesters);
router.get("/semesters/:id", semesterController.getSemesterById);
router.post("/semesters", semesterController.createSemester);
router.put("/semesters/:id", semesterController.updateSemester);
router.delete("/semesters/:id", semesterController.deleteSemester);

//Account
router.get("/students", getAllStudent);
router.get("/teachers", getAllTeacher);
router.post("/students", createNewAccount);
router.post("/teachers", createNewAccount);
router.put("/students/:id", updateAccount);
router.put("/teachers/:id", updateAccount);
router.delete("/students/:id", deleteAccount);
router.delete("/teachers/:id", deleteAccount);

//profile
router.put("/users/profile", authMiddleware, updateProfile);
router.put("/users/change-password", authMiddleware, changePassword);

//teacher

//classSection for teacher
router.get("/teacher/class-sections", authMiddleware, getTeacherSections);
router.get(
  "/teacher/class-sections/:classId/sessions",
  authMiddleware,
  getTeacherDetailSection,
);
router.get(
  "/teacher/sessions/:sessionId",
  authMiddleware,
  getTeacherDetailSessions,
);
//check already login
router.get("/auth/account", authMiddleware, (req, res) => {
  return res.json({
    user: req.user,
  });
});

//user
router.get("/user", getAllUser);

//student
router.get("/dashboard", authMiddleware, getDashboard);
router.get("/student/attendance", authMiddleware, getMyAttendance);
router.get("/schedule/week", authMiddleware, getWeekSchedule);

router.get("/schedule/today", authMiddleware, getTodaySchedule);

router.post(
  "/upload-video",
  authMiddleware,
  uploadVideo.single("video"),
  faceController.uploadFaceVideo,
);
router.get("/student/face-video", authMiddleware, faceController.getFaceVideo);
module.exports = router;
