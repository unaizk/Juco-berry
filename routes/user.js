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
router.get('/logout',auth.isLogin,userController.userLogout)


module.exports = router;
