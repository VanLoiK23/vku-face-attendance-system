const express = require('express');
const router = express.Router();
const {login,register,forgot_password,reset_password} = require('../controllers/authController');
const { getAllUser } = require('../controllers/userController');
// const {auth,authIsAdmin} = require('../middlewares/auth')
const authMiddleware = require('../middlewares/authMiddleware')

//apply middleware for all
// router.use([auth]);

//auth
router.post('/auth/reset-password',reset_password);
router.post('/auth/forgot-password',forgot_password);
router.post('/auth/register',register);
router.post('/auth/login',login);
router.get('/auth/account',authMiddleware,(req, res) => {
    return res.json({
        user: req.user
    });
});

//user
router.get('/user',getAllUser)

module.exports = router;