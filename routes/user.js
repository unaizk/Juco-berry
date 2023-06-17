var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')
const auth = require('../middleware/auth')

/*Get login page */
router.get('/',auth.isLogout,userController.loadLogin);
router.get('/login',auth.isLogout,userController.loadLogin);
router.post('/login',userController.verifyLogin);

/*Get signup page */
router.get('/signup',auth.isLogout,userController.loadSignup);
router.post('/signup',userController.insertUser);
router.get('/verify', userController.verifyEmail);
router.get('/home',auth.isLogin, userController.loadHome);
router.get('/logout',auth.isLogin,userController.userLogout);
router.get('/forget',auth.isLogout,userController.forgetLoad);
router.post('/forget',userController.forgetVerify);
router.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);
router.post('/forget-password',userController.resetPassword);
router.get('/otp',auth.isLogout,userController.loadOtp);
router.post('/otp',userController.sendOtp);
router.get('/verify-otp',auth.isLogout,userController.loadVerifyOtp);
router.post('/verify-otp',userController.verifyOtp);
router.get('/categoryProduct',auth.isLogin,userController.listProductByCategory)


module.exports = router;
