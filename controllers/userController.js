

// Load User model and other dependencies
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");
const adminHelpers = require('../helpers/adminHelpers')
const userHelpers = require('../helpers/userHelpers')
const categoryHelpers = require('../helpers/categoryHelpers')
const productHelpers = require('../helpers/productsHelpers')
const couponHelpers = require('../helpers/couponHelpers')

const accountSid = "AC5b08749806fb17d29e70c46231045f1a";
const authToken = "524284ec82c67ab3d82fd72ddd53a2f7";
const verifySid = "VA881219022be56f5c9c40f5b2b336e929";
const twilio = require("twilio")(accountSid, authToken);
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_P5xQ3Jx6p0diLy',
    key_secret: 'yg5JyFNX5hUiz5nnVp3xRZjl',
});


// signup user method
const loadSignup = async (req, res) => {
    try {
        await userHelpers.loadingSignup(req, res)

    } catch (error) {
        console.log(error.message);
    }
}
// login user method
const loadLogin = async (req, res) => {
    try {
        await userHelpers.loadingLogin(req, res)
    } catch (error) {
        console.log(error.message);
    }
}


const insertUser = async (req, res) => {
    try {
        await userHelpers.insertingUser(req, res)
    } catch (error) {
        console.log(error.message);
    }
}


// verifying email//

const verifyEmail = async (req, res) => {
    try {
        console.log(req.query.email, req.query.id);
        await userHelpers.verifyingEmail(req, res)
    } catch (error) {
        console.log(error.message);
    }
}

//verify login

const verifyLogin = async (req, res) => {
    try {
        await userHelpers.verifyingToLogin(req, res);
    } catch (error) {
        console.log(error.message);
    }
}
const loadHome = async (req, res) => {
    try {
        userHelpers.loadingHome(req, res)
    } catch (error) {
        console.log(error.message);
    }
}


const userLogout = async (req, res) => {
    try {
        userHelpers.userLoggedOut(req, res);
    } catch (error) {
        console.log(error.mssage);
    }
}

//forget password

const forgetLoad = async (req, res) => {
    try {
        userHelpers.loadingForget(req, res);
    } catch (error) {
        console.log(error.message);
    }
}
const forgetVerify = async (req, res) => {
    try {
        await userHelpers.forgetPasswordVerify(req, res);
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async (req, res) => {
    try {
        await userHelpers.forgetPasswordLoad(req, res);

    } catch (error) {
        console.log(error.message);
    }
}
const resetPassword = async (req, res) => {
    try {
        await userHelpers.resettingPassword(req, res);
    } catch (error) {
        console.log(error.message);
    }
}
//otp verification

// Load OTP form
const loadOtp = async (req, res) => {
    try {
        userHelpers.loadingOTP(req, res);
    } catch (error) {
        console.log(error.message);
    }
}

const sendOtp = async (req, res) => {
    try {
        await userHelpers.sendingOTP(req, res);
    } catch (error) {
        console.log(error.message);
    }
}

const loadVerifyOtp = async (req, res) => {
    try {
        userHelpers.loadingVerifyOTP(req, res);
    } catch (error) {
        console.log(error.message);
    }
}

const verifyOtp = async (req, res) => {
    try {
        await userHelpers.verifyingOtp(req, res);
    }
    catch (error) {
        console.log(error.message);
    }
}

const viewProduct = async (req, res) => {
    try {
        await userHelpers.viewProductDetails(req, res);
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async (req, res) => {
    try {
        await userHelpers.addingToCart(req, res)
    } catch (error) {
        console.log(error.message);
    }
}

const loadCart = async (req, res) => {
    try {
        await userHelpers.loadingCartPage(req, res);
    } catch (error) {
        console.log(error.message);
    }
}

const changeQuantity = async (req, res) => {
    try {
        const response = await userHelpers.changeProductQuantity(req, res);
        res.send(response)
    } catch (error) {
        console.log(error.message);
    }
}

const deleteProduct = async (req, res) => {
    try {
        const response = await userHelpers.deleteProductFromCart(req, res);
        res.send(response)
    } catch (error) {
        console.log(error.message);
    }
}

const userProfile = async (req, res) => {
    try {
        await userHelpers.loadUserProfile(req, res);
    } catch (error) {
        console.log(error.message);
    }
}

const editProfile = async (req, res) => {
    try {
        await userHelpers.editingUserProfile(req, res);
    } catch (error) {
        console.log(error.message);
    }
}

const addressList = async (req, res) => {
    try {
        await userHelpers.loadAddressList(req, res);
    } catch (error) {
        console.log(error.message);
    }
}

const addAddress = async (req, res) => {
    try {
        await userHelpers.addingAddress(req, res);
    } catch (error) {
        console.log(error.message);
    }
}

const addNewAddress = async (req, res) => {
    try {
        await userHelpers.addingNewAddress(req, res);
    } catch (error) {
        console.log(error.message);
    }
}

const deleteAddress = async (req, res) => {
    try {
        await userHelpers.deletingAddress(req, res)
    } catch (error) {
        console.log(error.message);
    }
}

const editAddress = async (req, res) => {
    try {
        await userHelpers.editingAddress(req, res)
    } catch (error) {
        console.log(error.message);
    }
}

const setAsDefault = async (req, res) => {
    try {
        const response = await userHelpers.settingAsDefault(req, res)

        res.send(response)
    } catch (error) {
        console.log(error.message);
    }
}

const changeAddress = async (req, res) => {
    try {
        await userHelpers.changingTheAddress(req, res)
    } catch (error) {
        console.log(error.message);
    }
}

const loadCheckout = async (req, res) => {
    try {
        await userHelpers.loadingCheckoutPage(req, res)
    } catch (error) {
        console.log(error.message);
    }
}

const placeOrder = async (req, res) => {
    try {
        let userId = req.session.user_id// Used for storing user details for further use in this route
        let orderDetails = req.body;

        // console.log(req.body,'vvvvvvvvvvvvvvvvvvvvvvvv');

        let orderedProducts = await userHelpers.getProductListForOrders(userId);
        // console.log(orderedProducts,'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
        if (orderedProducts) {
            let totalOrderValue = await userHelpers.getCartValue(userId);
            const availableCouponData = await couponHelpers.checkCurrentCouponValidityStatus(userId, totalOrderValue);
            if (availableCouponData.status) {
                const couponDiscountAmount = availableCouponData.couponDiscount;

                // Inserting the value of coupon discount into the order details object created above
                orderDetails.couponDiscount = couponDiscountAmount;

                // Updating the total order value with coupon discount applied
                totalOrderValue = totalOrderValue - couponDiscountAmount;

                const updateCouponUsedStatusResult = await couponHelpers.updateCouponUsedStatus(userId, availableCouponData.couponId);

            }
            userHelpers.placingOrder(userId, orderDetails, orderedProducts, totalOrderValue).then((orderId) => {
                if (req.body['paymentMethod'] === 'COD') {
                    res.json({ COD_CHECKOUT: true });
                } else if (req.body['paymentMethod'] === 'ONLINE') {
                    userHelpers.generateRazorpayOrder(orderId, totalOrderValue).then(async (razorpayOrderDetails) => {
                        const user = await User.findById({ _id: userId }).lean()
                        res.json(
                            {

                                ONLINE_CHECKOUT: true,
                                userDetails: user,
                                userOrderRequestData: orderDetails,
                                orderDetails: razorpayOrderDetails,
                                razorpayKeyId: 'rzp_test_P5xQ3Jx6p0diLy'
                            }
                        )

                    })
                } else {
                    res.json({ paymentStatus: false });
                }
            })
        } else {
            res.json({ checkoutStatus: false });
        }



    } catch (error) {
        console.log(error.message);
    }
}

const orderPlaced = async (req, res) => {
    try {
        res.render('users/orderPlaced', { layout: 'user-layout' })
    } catch (error) {
        console.log(error.message);
    }
}

const orderFailed = async (req, res) => {
    try {
        res.render('users/orderFailed', { layout: 'user-layout' })
    } catch (error) {
        console.log(error.message);
    }
}

const orderDetails = async (req, res) => {
    try {
        await userHelpers.loadOrderDetails(req, res)
    } catch (error) {
        console.log(error.message);
    }
}

const loadOrdersView = async (req, res) => {
    try {
        await userHelpers.loadingOrdersViews(req, res)
    } catch (error) {
        console.log(error.message);
    }
}

const cancellOrder = async (req, res) => {
    try {
        const id = req.body.orderId


        const url = '/ordersView?id=' + id;



        await userHelpers.cancellingOrder(id);

        res.redirect(url)

    } catch (error) {

        console.log(error.message);

    }
}

const verifyPayment = async (req, res) => {
    userHelpers.verifyOnlinePayment(req.body).then(() => {
        let receiptId = req.body['serverOrderDetails[receipt]'];

        let paymentSuccess = true;
        userHelpers.updateOnlineOrderPaymentStatus(receiptId, paymentSuccess).then(() => {
            // Sending the receiptId to the above userHelper to modify the order status in the DB
            // We have set the Receipt Id is same as the orders cart collection ID

            res.json({ status: true });
        })
    }).catch((err) => {
        if (err) {
            console.log(err);

            let paymentSuccess = false;
            userHelpers.updateOnlineOrderPaymentStatus(receiptId, paymentSuccess).then(() => {
                // Sending the receiptId to the above userHelper to modify the order status in the DB
                // We have set the Receipt Id is same as the orders cart collection ID

                res.json({ status: false });
            })
        }
    })
}


const categoryProducts = async (req, res) => {
    try {
        const categories = await userHelpers.getCategory()
        const products = await productHelpers.getAllProducts();
        res.render('users/categoryProducts', { layout: 'user-layout', categories, products });
    } catch (error) {
        console.log(error.message);
    }
}

const listCategory = async (req, res) => {
    try {
        const catId = await userHelpers.getCategoryByName(req.body.status);
        const products = await userHelpers.listCategorys(catId._id);
        const categories = await userHelpers.getCategory();
        res.render('users/categoryProducts', { layout: 'user-layout', products, categories });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const loadWallet = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const walletDetails = await userHelpers.getWalletDetails(userId);
      let orderDetails = await userHelpers.orderDetails(userId);

       // Reverse the order of transactions
     orderDetails = orderDetails.reverse();
  
      // Pagination logic
      const currentPage = parseInt(req.query.page) || 1; // Get the current page number from the query parameter
      const PAGE_SIZE = 5; // Number of transactions per page
  
      // Calculate the total number of pages
      const totalPages = Math.ceil(orderDetails.length / PAGE_SIZE);
  
      // Determine the start and end index of the current page
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
  
      // Get the transactions for the current page
      const paginatedOrderDetails = orderDetails.slice(startIndex, endIndex);
  
      // Determine if there are previous and next pages
      const hasPrev = currentPage > 1;
      const hasNext = currentPage < totalPages;
  
      // Generate an array of page objects for pagination links
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        pages.push({
          number: i,
          current: i === currentPage
        });
      }
  
      res.render('users/wallet', {
        layout: 'user-layout',
        walletDetails,
        orderDetails: paginatedOrderDetails, // Pass the paginated order details to the template
        showPagination: orderDetails.length > PAGE_SIZE,
        hasPrev,
        prevPage: currentPage - 1,
        hasNext,
        nextPage: currentPage + 1,
        pages
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  };
  


module.exports = {
    loadSignup,
    insertUser,
    verifyEmail,
    loadLogin,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    loadOtp,
    sendOtp,
    loadVerifyOtp,
    verifyOtp,
    viewProduct,
    addToCart,
    loadCart,
    changeQuantity,
    deleteProduct,
    userProfile,
    editProfile,
    addressList,
    addAddress,
    deleteAddress,
    editAddress,
    setAsDefault,
    loadCheckout,
    changeAddress,
    addNewAddress,
    placeOrder,
    orderDetails,
    loadOrdersView,
    cancellOrder,
    orderPlaced,
    orderFailed,
    verifyPayment,
    categoryProducts,
    listCategory,
    loadWallet
}