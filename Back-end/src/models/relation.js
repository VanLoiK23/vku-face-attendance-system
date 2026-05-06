const AttendanceRecord = require("./AttendanceRecord");
const AttendanceSession = require("./AttendanceSession");
const Class = require("./class");
const FaceEmbedding = require("./FaceEmbedding");
const Schedule = require("./schedule");
const Student = require("./student");
const Teacher = require("./teacher");
const User = require("./user");

// ================= USER =================

// User - Teacher
User.hasOne(Teacher, { foreignKey: 'user_id', as: 'teacher' });
Teacher.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Student
User.hasOne(Student, { foreignKey: 'user_id', as: 'student' });
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


// ================= CLASS =================

// Teacher - Class
Teacher.hasMany(Class, { foreignKey: 'teacher_id', as: 'classes' });
Class.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });

// Student - Class (Many-to-Many)
Student.belongsToMany(Class, {
    through: 'enrollments',
    foreignKey: 'student_id',
    otherKey: 'class_id',
    as: 'classes'
});

Class.belongsToMany(Student, {
    through: 'enrollments',
    foreignKey: 'class_id',
    otherKey: 'student_id',
    as: 'students'
});


// ================= SCHEDULE =================

// Class - Schedule
Class.hasMany(Schedule, { foreignKey: 'class_id', as: 'schedules' });
Schedule.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

// Schedule - Session
Schedule.hasMany(AttendanceSession, { foreignKey: 'schedule_id', as: 'sessions' });
AttendanceSession.belongsTo(Schedule, { foreignKey: 'schedule_id', as: 'schedule' });


// ================= ATTENDANCE =================

// Session - Record
AttendanceSession.hasMany(AttendanceRecord, { foreignKey: 'session_id', as: 'records' });
AttendanceRecord.belongsTo(AttendanceSession, { foreignKey: 'session_id', as: 'session' });

// Student - Record
Student.hasMany(AttendanceRecord, { foreignKey: 'student_id', as: 'attendanceRecords' });
AttendanceRecord.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });


// ================= FACE =================

// Student - Embedding
Student.hasMany(FaceEmbedding, { foreignKey: 'student_id', as: 'embeddings' });
FaceEmbedding.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });