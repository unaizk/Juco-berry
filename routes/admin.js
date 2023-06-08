var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')
const adminAuth = require('../middleware/adminAuth')


router.get('/',adminAuth.isLogout,adminController.loadLogin)
router.post('/',adminController.verifyLogin)
router.get('/admin-home',adminAuth.isLogin,adminController.loadDashboard);
router.get('/logout',adminAuth.isLogin,adminController.logout);
router.get('/admin-forget',adminAuth.isLogout,adminController.forgetLoad)
router.post('/admin-forget',adminController.forgetVerify);
router.get('/admin-forget-password',adminAuth.isLogout,adminController.forgetPasswordLoad)
router.post('/admin-forget-password',adminController.forgetPasswordVerify);







router.get('*',(req,res)=>{
    res.redirect('/admin')
});

module.exports = router;
