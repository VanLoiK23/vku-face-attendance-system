const AttendanceRecord = require("./AttendanceRecord");
const AttendanceSession = require("./AttendanceSession");
const ClassSection = require("./class_section");
const Cohort = require("./cohort");
const FaceEmbedding = require("./FaceEmbedding");
const Schedule = require("./schedule");
const Semester = require("./semester");
const Student = require("./student");
const Subject = require("./subject");
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
// Teacher.hasMany(Class, { foreignKey: 'teacher_id', as: 'classes' });
// Class.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
Teacher.hasMany(ClassSection, { foreignKey: 'teacher_id', as: 'sections' });
ClassSection.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });

// Student - Class (Many-to-Many)
// Student.belongsToMany(Class, {
//     through: 'enrollments',
//     foreignKey: 'student_id',
//     otherKey: 'class_id',
//     as: 'classes'
// });

// Class.belongsToMany(Student, {
//     through: 'enrollments',
//     foreignKey: 'class_id',
//     otherKey: 'student_id',
//     as: 'students'
// });
Student.belongsToMany(ClassSection, {
    through: 'enrollments',
    foreignKey: 'student_id',
    otherKey: 'class_section_id',
    as: 'classSections'
});

ClassSection.belongsToMany(Student, {
    through: 'enrollments',
    foreignKey: 'class_section_id',
    otherKey: 'student_id',
    as: 'students'
});


Cohort.hasMany(Student, { foreignKey: 'cohort_id', as: 'students' });
Student.belongsTo(Cohort, { foreignKey: 'cohort_id', as: 'cohort' });

// ================= SCHEDULE =================

// Class - Schedule
ClassSection.hasMany(Schedule, { foreignKey: 'class_section_id', as: 'schedules' });
Schedule.belongsTo(ClassSection, { foreignKey: 'class_section_id', as: 'classSection' });

// Class - Semeter
Semester.hasMany(Schedule, { 
    foreignKey: 'semester_id',
    as: 'schedules',
    onDelete: 'RESTRICT' // Chặn xóa học kỳ nếu còn lịch
});

Schedule.belongsTo(Semester, { 
    foreignKey: 'semester_id',
    as: 'semester' 
});

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


Subject.hasMany(ClassSection, { foreignKey: 'subject_id', as: 'sections' });
ClassSection.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });