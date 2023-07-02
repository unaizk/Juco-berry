var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')
const auth = require('../middleware/auth')
const multer = require('multer')
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/userImage'))
    },
    filename: (req, file, cb) => {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name)
    }
  })

  const userUpload = multer({ storage: storage })
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
router.get('/view-product',auth.isLogin,userController.viewProduct)
router.post('/addtocart',userController.addToCart);
router.get('/cart',auth.isLogin,userController.loadCart);
router.post('/change-product-quantity',userController.changeQuantity)
router.post('/delete-product-from-cart',userController.deleteProduct)
router.get('/user-profile',auth.isLogin,userController.userProfile);
router.post('/edit-user',userUpload.single('image'),userController.editProfile);
router.get('/address',auth.isLogin,userController.addressList)
router.post('/address',userController.addAddress);
router.post('/add-new-address',userController.addNewAddress)
router.get('/delete-address',auth.isLogin,userController.deleteAddress);
router.post('/edit-address',userController.editAddress);
router.post('/set-as-default',userController.setAsDefault);
router.post('/change-address',userController.changeAddress);
router.get('/checkout',auth.isLogin,userController.loadCheckout);
router.post('/place-order',userController.placeOrder)
router.get('/order-details',auth.isLogin,userController.orderDetails)
router.get('/ordersView',auth.isLogin,userController.loadOrdersView)
router.post('/cancel-order',userController.cancellOrder)



module.exports = router;
