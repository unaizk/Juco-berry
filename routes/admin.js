var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')
const adminAuth = require('../middleware/adminAuth')
const multer = require('multer')
const path = require('path'); 

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
      cb(null,path.join(__dirname,'../public/productImages'))
    },
    filename:(req,file,cb)=>{
      const name = Date.now()+'-'+file.originalname;
      cb(null,name)
    }
  })
  
  const upload = multer({storage:storage})


router.get('/',adminAuth.isLogout,adminController.loadLogin)
router.post('/',adminController.verifyLogin)
router.get('/admin-home',adminAuth.isLogin,adminController.loadDashboard);
router.get('/logout',adminAuth.isLogin,adminController.logout);
router.get('/admin-forget',adminAuth.isLogout,adminController.forgetLoad)
router.post('/admin-forget',adminController.forgetVerify);
router.get('/admin-forget-password',adminAuth.isLogout,adminController.forgetPasswordLoad)
router.post('/admin-forget-password',adminController.forgetPasswordVerify);
// Route for blocking a user
router.get('/block-user', adminAuth.isLogin, adminController.blockingUser);

// Route for rendering the admin users page
router.get('/admin-users', adminAuth.isLogin, adminController.usersList);

// Route for rendering the blocked users page
router.get('/blocked-users', adminAuth.isLogin, adminController.blockedUsers);

// Route for unblocking a user
router.get('/unblock-user', adminAuth.isLogin, adminController.unblockingUser);

// Route for editing user (load)
router.get('/edit-user', adminAuth.isLogin, adminController.editUserLoad);

// Route for updating user
router.post('/edit-user', adminController.updateUser);


router.get('/category',adminAuth.isLogin,adminController.loadCategory)
router.post('/category',adminController.addCategory)
router.get('/remove-category',adminAuth.isLogin,adminController.removeCategory)
router.get('/products',adminAuth.isLogin,adminController.loadProducts);
router.post('/products',upload.single('image'),adminController.insertProducts)
router.get('/delete-product',adminAuth.isLogin,adminController.deleteProduct)


router.get('*',(req,res)=>{
    res.redirect('/admin')
});

module.exports = router;
