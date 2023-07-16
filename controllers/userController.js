

// Load User model and other dependencies
const User = require('../models/userModel');
const Cart = require('../models/cartModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");
const adminHelpers = require('../helpers/adminHelpers')
const userHelpers = require('../helpers/userHelpers')
const categoryHelpers = require('../helpers/categoryHelpers')
const productHelpers = require('../helpers/productsHelpers')
const couponHelpers = require('../helpers/couponHelpers')
const offerHelpers = require('../helpers/offerHelpers')
require('dotenv').config()

const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});


// signup user method
const loadSignup = async (req, res) => {
    try {
        await userHelpers.loadingSignup(req, res)

    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}
// login user method
const loadLogin = async (req, res) => {
    try {
        await userHelpers.loadingLogin(req, res)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}


const insertUser = async (req, res) => {
    try {
        await userHelpers.insertingUser(req, res)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}


// verifying email//

const verifyEmail = async (req, res) => {
    try {
        console.log(req.query.email, req.query.id);
        await userHelpers.verifyingEmail(req, res)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

//verify login

const verifyLogin = async (req, res) => {
    try {
        await userHelpers.verifyingToLogin(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}
const loadHome = async (req, res) => {
    try {
        userHelpers.loadingHome(req, res)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
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
        res.redirect('/user-error')
    }
}
const forgetVerify = async (req, res) => {
    try {
        await userHelpers.forgetPasswordVerify(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const forgetPasswordLoad = async (req, res) => {
    try {
        await userHelpers.forgetPasswordLoad(req, res);

    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}
const resetPassword = async (req, res) => {
    try {
        await userHelpers.resettingPassword(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}
//otp verification

// Load OTP form
const loadOtp = async (req, res) => {
    try {
        userHelpers.loadingOTP(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const sendOtp = async (req, res) => {
    try {
        await userHelpers.sendingOTP(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const loadVerifyOtp = async (req, res) => {
    try {
        userHelpers.loadingVerifyOTP(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const verifyOtp = async (req, res) => {
    try {
        await userHelpers.verifyingOtp(req, res);
    }
    catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const viewProduct = async (req, res) => {
    try {
        await userHelpers.viewProductDetails(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const addToCart = async (req, res) => {
    try {
        await userHelpers.addingToCart(req, res)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const loadCart = async (req, res) => {
    try {
        await userHelpers.loadingCartPage(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const changeQuantity = async (req, res) => {
    try {
        const response = await userHelpers.changeProductQuantity(req, res);
        res.send(response)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const deleteProduct = async (req, res) => {
    try {
        const response = await userHelpers.deleteProductFromCart(req, res);
        res.send(response)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const userProfile = async (req, res) => {
    try {
        await userHelpers.loadUserProfile(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const editProfile = async (req, res) => {
    try {
        await userHelpers.editingUserProfile(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const addressList = async (req, res) => {
    try {
        await userHelpers.loadAddressList(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const addAddress = async (req, res) => {
    try {
        await userHelpers.addingAddress(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const addNewAddress = async (req, res) => {
    try {
        await userHelpers.addingNewAddress(req, res);
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const deleteAddress = async (req, res) => {
    try {
        await userHelpers.deletingAddress(req, res)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const editAddress = async (req, res) => {
    try {
        await userHelpers.editingAddress(req, res)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const setAsDefault = async (req, res) => {
    try {
        const response = await userHelpers.settingAsDefault(req, res)

        res.send(response)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const changeAddress = async (req, res) => {
    try {
        await userHelpers.changingTheAddress(req, res)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const loadCheckout = async (req, res) => {
    try {
        await userHelpers.loadingCheckoutPage(req, res)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
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
            // Inserting the actual order value of the cart without any discounts for storing into the DB OrderDetails
            orderDetails.actualOrderValue = totalOrderValue;
            // ====================================== Coupon Discounts Calculation ======================================
            const availableCouponData = await couponHelpers.checkCurrentCouponValidityStatus(userId, totalOrderValue);

            let couponDiscountAmount = 0;

            if (availableCouponData.status) {
                const couponDiscountAmount = availableCouponData.couponDiscount;
                  // Inserting the value of coupon discount into the order details object created above
                orderDetails.couponDiscount = couponDiscountAmount
                
                // Updating the total order value with coupon discount applied
                totalOrderValue = totalOrderValue - couponDiscountAmount;

                const updateCouponUsedStatusResult = await couponHelpers.updateCouponUsedStatus(userId, availableCouponData.couponId);

            }
          ;

            // ========================================== Product Offer Discounts Calculation ==========================================

            // Finding existing product offer applicable to the cart and applying it to the cart value

            const applicableProductOffers = await offerHelpers.calculateProductOfferDiscountsForCart(userId);
       

            const productOfferDiscount = applicableProductOffers;

            // Inserting the value of product offer discount into the order details object created above
            orderDetails.productOfferDiscount = applicableProductOffers;

            // Updating the total order value with the eligible product offer discount

            // ========================================== Category Offer Discounts Calculation ==========================================

            // Finding existing category offer applicable to the cart and applying it to the cart value

            const applicableCategoryOffers = await offerHelpers.calculateCategoryOfferAmountForCart(userId);
            const categoryOfferDiscount = applicableCategoryOffers;
            
            // Inserting the value of category offer discount into the order details object created above
            orderDetails.categoryOfferDiscount = applicableCategoryOffers;

            // Updating the total order value with the eligible category offer discount
            const total = totalOrderValue - productOfferDiscount - categoryOfferDiscount

            console.log(total, 'totalvvvvvvvvvvvvvvv');
            // =============================================== Proceeding for order Creation ===============================================
            if (req.body['paymentMethod'] === 'COD') {
                userHelpers.placingOrder(userId, orderDetails, orderedProducts, total).then(async (orderId, error) => {
                    res.json({ COD_CHECKOUT: true });
                })

            } else if (req.body['paymentMethod'] === 'WALLET') {
                const walletBalance = await userHelpers.walletBalance(userId);
                if (walletBalance.walletAmount >= total) {
                    userHelpers.placingOrder(userId, orderDetails, orderedProducts, total).then(async (orderId, error) => {
                        res.json({ WALLET_CHECKOUT: true, orderId });
                    })
                } else {
                    res.json({ error: 'Insufficient balance.' })
                }
            }

            else if (req.body['paymentMethod'] === 'ONLINE') {
                userHelpers.placingOrder(userId, orderDetails, orderedProducts, total).then(async (orderId, error) => {
                    if (error) {
                        res.json({ checkoutStatus: false });
                    } else {
                        userHelpers.generateRazorpayOrder(orderId, total).then(async (razorpayOrderDetails, err) => {
                            const user = await User.findById({ _id: userId }).lean()
                            res.json(
                                {

                                    ONLINE_CHECKOUT: true,
                                    userDetails: user,
                                    userOrderRequestData: orderDetails,
                                    orderDetails: razorpayOrderDetails,
                                    razorpayKeyId: process.env.KEY_ID,
                                }
                            )

                        })
                    }

                })

            } else {
                res.json({ paymentStatus: false });
            }

        } else {
            res.json({ checkoutStatus: false });
        }



    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const orderPlaced = async (req, res) => {
    try {
        res.render('users/orderPlaced', { layout: 'user-layout' })
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const walletOrder = async (req, res) => {
    try {
        const orderId = req.query.id
        console.log(orderId, 'orderIddddd');
        const userId = req.session.user_id
        const updatingWallet = await userHelpers.updateWallet(userId, orderId);
        res.redirect('/orderPlaced')
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const orderFailed = async (req, res) => {
    try {
        res.render('users/orderFailed', { layout: 'user-layout' })
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const orderDetails = async (req, res) => {
    try {
        await userHelpers.loadOrderDetails(req, res)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const loadOrdersView = async (req, res) => {
    try {
        await userHelpers.loadingOrdersViews(req, res)
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
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
        res.redirect('/user-error')

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

            console.log(err.message);


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

         // Pagination logic
         const currentPage = parseInt(req.query.page) || 1;
         const PAGE_SIZE = 6;
 
         const totalItems = products.length;
         const totalPages = Math.ceil(totalItems / PAGE_SIZE);
 
         const startIndex = (currentPage - 1) * PAGE_SIZE;
         const endIndex = startIndex + PAGE_SIZE;
         const paginatedOrderDetails = products.slice(startIndex, endIndex);
 
         const hasPrev = currentPage > 1;
         const hasNext = currentPage < totalPages;
 
         const pages = [];
         for (let i = 1; i <= totalPages; i++) {
             pages.push({
                 number: i,
                 current: i === currentPage,
             });
         }
        res.render('users/categoryProducts', { layout: 'user-layout', categories, products:paginatedOrderDetails, showPagination: totalItems > PAGE_SIZE,
        hasPrev,
        prevPage: currentPage - 1,
        hasNext,
        nextPage: currentPage + 1,
        pages, });
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}

const listCategory = async (req, res) => {
    try {
        const catId = await userHelpers.getCategoryByName(req.body.status);
        const products = await userHelpers.listCategorys(catId._id);
        const categories = await userHelpers.getCategory();
        res.render('users/categoryProducts', { layout: 'user-layout', products, categories });
    } catch (error) {

        console.log(error.message);
        res.redirect('/user-error')
    }
}

const loadWallet = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const walletDetails = await userHelpers.getWalletDetails(userId);
        const creditOrderDetails = await userHelpers.creditOrderDetails(userId);
        const debitOrderDetails = await userHelpers.debitOrderDetails(userId);

        // Merge credit and debit order details into a single array
        const orderDetails = [...creditOrderDetails, ...debitOrderDetails];

        // Sort the merged order details by date and time in descending order
        orderDetails.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Pagination logic
        const currentPage = parseInt(req.query.page) || 1;
        const PAGE_SIZE = 5;

        const totalItems = orderDetails.length;
        const totalPages = Math.ceil(totalItems / PAGE_SIZE);

        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginatedOrderDetails = orderDetails.slice(startIndex, endIndex);

        const hasPrev = currentPage > 1;
        const hasNext = currentPage < totalPages;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push({
                number: i,
                current: i === currentPage,
            });
        }

        res.render('users/wallet', {
            layout: 'user-layout',
            walletDetails,
            orderDetails: paginatedOrderDetails,
            showPagination: totalItems > PAGE_SIZE,
            hasPrev,
            prevPage: currentPage - 1,
            hasNext,
            nextPage: currentPage + 1,
            pages,
        });
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
};

const errorPageLoad = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userDetails = await User.findOne({ _id: userId }).lean()
        res.render('users/user-404', { layout: 'user-layout', userDetails })
    } catch (error) {
        console.log(error.message);
        res.redirect('/user-error')
    }
}




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
    loadWallet,
    walletOrder,
    errorPageLoad
}