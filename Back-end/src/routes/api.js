const express = require('express');
const router = express.Router();
const {login,register,forgot_password,reset_password} = require('../controllers/authController');
const { getAllUser,getAllStudent, getAllTeacher } = require('../controllers/admin/userController');
const {getSubjects,createSubject,updateSubject,deleteSubject} = require('../controllers/admin/subjectController')
const {getClassSection,createClassSection,updateClassSection,deleteClassSection} = require('../controllers/admin/classSectionController')
const cohortController = require('../controllers/admin/cohortController');
// const {auth,authIsAdmin} = require('../middlewares/auth')
const authMiddleware = require('../middlewares/authMiddleware');
const enrollmentController = require('../controllers/admin/enrollmentController');

//apply middleware for all
// router.use([auth]);

//auth
router.post('/auth/reset-password',reset_password);
router.post('/auth/forgot-password',forgot_password);
router.post('/auth/register',register);
router.post('/auth/login',login);

//subjects
router.get('/subjects',getSubjects);
router.post('/subjects',createSubject);
router.put('/subjects/:id',updateSubject);
router.delete('/subjects/:id',deleteSubject);

//Class sections
router.get('/class-sections',getClassSection);
router.post('/class-sections',createClassSection);
router.put('/class-sections/:id',updateClassSection);
router.delete('/class-sections/:id',deleteClassSection);

//Enrollment
router.post('/enrollments', enrollmentController.enrollStudent);
router.delete('/enrollments', enrollmentController.removeStudent);

//Cohort
router.get('/cohorts', cohortController.getAll);
router.post('/cohorts', cohortController.create);
router.put('/cohorts/:id', cohortController.update);
router.delete('/cohorts/:id', cohortController.delete);

router.get('/cohorts/:id/students', cohortController.getStudents);
router.post('/cohorts/:cohortId/students', cohortController.assignStudents);
router.delete('/cohorts/:cohortId/students/:sid', cohortController.removeStudent);

//check already login
router.get('/auth/account',authMiddleware,(req, res) => {
    return res.json({
        user: req.user
    });
});

//user
router.get('/user',getAllUser)
router.get('/students',getAllStudent)
router.get('/teachers',getAllTeacher)

module.exports = router;