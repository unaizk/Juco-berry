var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController')
const adminAuth = require('../middleware/adminAuth')
const multer = require('multer')
const path = require('path');
const categoryHelpers = require('../helpers/categoryHelpers');
const couponController = require('../controllers/couponController')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/productImages'))
  },
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name)
  }
})

const upload = multer({ storage: storage })


router.get('/', adminAuth.isLogout, adminController.loadLogin)
router.post('/', adminController.verifyLogin)
router.get('/admin-home', adminAuth.isLogin, adminController.loadDashboard);
router.get('/logout', adminAuth.isLogin, adminController.logout);
router.get('/admin-forget', adminAuth.isLogout, adminController.forgetLoad)
router.post('/admin-forget', adminController.forgetVerify);
router.get('/admin-forget-password', adminAuth.isLogout, adminController.forgetPasswordLoad)
router.post('/admin-forget-password', adminController.forgetPasswordVerify);
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


router.get('/category', adminAuth.isLogin, adminController.loadCategory)
router.post('/category', adminController.addCategory)
router.get('/unlist-category', adminAuth.isLogin, adminController.unlistCategory)
router.get('/unlisted-category', adminAuth.isLogin, adminController.unlistedCategory)
router.get('/list-category', adminAuth.isLogin, adminController.listCategory)
router.get('/products', adminAuth.isLogin, adminController.loadProducts);
router.post('/products', upload.array('image'), adminController.insertProducts)
router.get('/unlist-products', adminAuth.isLogin, adminController.unlistProduct)
router.get('/unlisted-products', adminAuth.isLogin, adminController.unlistedProducts)
router.get('/list-products', adminAuth.isLogin, adminController.listProducts);
router.get('/edit-category',adminAuth.isLogin,adminController.editCategoryLoad);
router.post('/edit-category',adminController.updateCategory);
router.get('/edit-product',adminAuth.isLogin,adminController.editProductLoad)
router.post('/edit-product',upload.array('image'),adminController.updateProduct)
router.get('/ordersList',adminAuth.isLogin,adminController.loadOrdersList)
router.get('/ordersView',adminAuth.isLogin,adminController.loadOrdersView);
router.post('/cancel-by-admin',adminController.cancelledByAdmin);
router.post('/reject-by-admin',adminController.rejectCancellation)
router.post('/prepare-by-admin',adminController.preparingFood)
router.post('/deliver-by-admin',adminController.deliveredFood);
router.get('/manage-coupons',adminAuth.isLogin, couponController.manageCoupon);
router.get('/add-coupon',adminAuth.isLogin, couponController.addNewCouponGET);
router.post('/add-coupon', couponController.addNewCouponPOST);
router.get('/inactive-coupons',adminAuth.isLogin,couponController.inactiveCouponsGET);
router.get('/edit-coupon',adminAuth.isLogin, couponController.editCouponGET);
router.post('/update-coupon',couponController.updateCouponPOST)
router.post('/change-coupon-status',couponController.changeCouponStatusPOST)
router.get('/admin-error',adminAuth.isLogin,adminController.errorPageLoad)


router.get('*', (req, res) => {
  res.redirect('/admin')
});

module.exports = router;
