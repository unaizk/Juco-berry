const multer = require('multer')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");
var path = require('path');
const fs = require('fs')
const User = require('../models/userModel');
const Order = require('../models/ordersModel')
const Coupon = require('../models/couponModel')
const Wallet = require('../models/walletModel')
const moment = require("moment-timezone");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
    passwordHash: async (password) => {
        try {
            const hashPassword = await bcrypt.hash(password, 10);
            return hashPassword;
        } catch (error) {
            console.log(error.message, 'password hash problem')
            res.redirect('/admin/admin-error')
        }
    },

    sendingResetPasswordMail: async (name, email, token) => {
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: config.emailUser,
                    pass: config.emailPassword
                }
            });
            const mailOption = {
                from: 'unais5676@gmail.com',
                to: email,
                subject: 'To Reset password',

                html: '<p> Hi ' + name + ', please click here to <a href="http://localhost:3000/admin/admin-forget-password?token=' + token + '">Reset </a>your password.</p>'
            }
            transporter.sendMail(mailOption, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Your email has been send succefully", info.response);
                }
            })
        } catch (error) {
            console.log(error.message, 'Failed to send verification email')

            res.redirect('/admin/admin-error')
        }
    },

    loadingLogin: async (req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.render('admin/admin-login', { layout: 'admin-layout' })
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    verifyingLogin: async (req, res) => {
        try {
            const email = req.body.email;
            const password = req.body.password;


            userData = await User.findOne({ email: email })

            if (userData) {

                const passwordMatch = await bcrypt.compare(password, userData.password);

                if (passwordMatch) {
                    if (userData.is_admin === false) {
                        res.render('admin/admin-login', { layout: 'admin-layout', message: 'You are not admin' })
                    } else {
                        req.session.user_id = userData._id;
                        req.session.is_admin = userData.is_admin


                        res.redirect('admin/admin-home')
                    }
                } else {
                    res.render('admin/admin-login', { message: "Your password is incorrect", layout: 'admin-layout' })
                }
            } else {
                res.render('admin/admin-login', { message: "Your email is incorrect", layout: 'admin-layout' })
            }
        } catch (error) {
            console.log(error.message, 'failed to verify login')

            res.redirect('/admin/admin-error')
        }
    },

    loadingDashboard: async (req, res) => {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await User.find({}).lean().exec();
                const totaluser = users.length;

                const totalSales = await Order.aggregate([
                    {
                        $match: {
                            orderStatus: { $nin: ["cancelled"] },

                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalSum: { $sum: "$orderValue" },
                        },
                    },
                ]);

                const salesbymonth = await Order.aggregate([
                    {
                        $match: {
                            orderStatus: { $nin: ["cancelled"] },
                        },
                    },
                    {
                        $group: {
                            _id: { $month: "$date" },
                            totalSales: { $sum: "$orderValue" },
                        },
                    },
                    {
                        $sort: {
                            _id: 1,
                        },
                    },
                ]);

                const paymentMethod = await Order.aggregate([
                    {
                      $match: {
                        orderStatus: { $in: ["Placed", "Delivered","Preparing food"] }, // Exclude "cancelled" status
                      },
                    },
                    {
                      $group: {
                        _id: "$paymentMethod", // Group by paymentMethod only
                        totalOrderValue: { $sum: "$orderValue" },
                        count: { $sum: 1 },
                      },
                    },
                  ]);

                const currentYear = new Date().getFullYear();
                const previousYear = currentYear - 1;

                const yearSales = await Order.aggregate([
                    // Match orders within the current year or previous year
                    {
                        $match: {
                            orderStatus: { $nin: ["cancelled"] },
                            date: {
                                $gte: new Date(`${previousYear}-01-01`),
                                $lt: new Date(`${currentYear + 1}-01-01`),
                            },
                        },
                    },
                    // Group orders by year and calculate total sales
                    {
                        $group: {
                            _id: {
                                $year: "$date",
                            },
                            totalSales: {
                                $sum: "$orderValue",
                            },
                        },
                    },
                ])
                    .exec();


                // to get today sales

                console.log(yearSales, 'yearSales');

                const todaysalesDate = new Date();
                const startOfDay = new Date(
                    todaysalesDate.getFullYear(),
                    todaysalesDate.getMonth(),
                    todaysalesDate.getDate(),
                    0,
                    0,
                    0,
                    0
                );
                const endOfDay = new Date(
                    todaysalesDate.getFullYear(),
                    todaysalesDate.getMonth(),
                    todaysalesDate.getDate(),
                    23,
                    59,
                    59,
                    999
                );

                const todaySales = await Order.aggregate([
                    {
                        $match: {
                            orderStatus: { $in: ["pending", "Delivered", "Placed","Preparing food"] },

                            date: {
                                $gte: startOfDay, // Set the current date's start time
                                $lt: endOfDay,
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$orderValue" },
                        },
                    },
                ]);

                const dashBoardDetails = {
                    totaluser,
                    totalSales,
                    salesbymonth,
                    paymentMethod,
                    yearSales,
                    todaySales
                }

                resolve(dashBoardDetails)



            } catch (error) {
                reject(error)
            }
        })

    },

    loggingOut: async (req, res) => {
        try {
            req.session.destroy();
            res.redirect('admin/admin-login')
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    forgetPageLoad: async (req, res) => {
        try {
            res.render('admin/admin-forget', { layout: 'admin-layout' })
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    forgetVerifying: async (req, res) => {
        try {
            const email = req.body.email;
            const userData = await User.findOne({ email: email });
            if (userData) {
                if (userData.is_admin === false) {
                    res.render('admin/admin-forget', { messages: "You are not admin", layout: 'admin-layout' })
                } else {
                    const randomString = randomstring.generate()
                    const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } })
                    module.exports.sendingResetPasswordMail(userData.name, userData.email, randomString);
                    res.render('admin/admin-forget', { message: "Please check your mail to reset password", layout: 'admin-layout' })
                }
            } else {
                res.render('admin/admin-forget', { messages: "Your email is incorrect", layout: 'admin-layout' })
            }
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    forgetPasswordPageLoad: async (req, res) => {
        try {
            const token = req.query.token;
            const tokenData = await User.findOne({ token: token });
            if (tokenData) {
                res.render('admin/admin-forget-password', { user_id: tokenData._id, layout: 'admin-layout' })
            } else {
                res.render('admin/admin-404', { layout: 'admin-layout' })
            }
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    forgetPasswordVerifying: async (req, res) => {
        try {
            const password = req.body.password;
            const user_id = req.body.user_id;
            const sPassword = await module.exports.passwordHash(password)
            const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: sPassword, token: '' } })
            res.redirect('admin/admin-home')
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    userListing: async (req, res) => {
        try {
            const userData = await User.find({ is_admin: false, blocked: false }).lean();
            const usersWithSerialNumber = userData.map((user, index) => ({
                ...user,
                serialNumber: index + 1
            }));
            console.log(usersWithSerialNumber);
            res.render('admin/admin-users', { layout: "admin-layout", users: usersWithSerialNumber });
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    editingUserPageLoad: async (req, res) => {
        try {
            const id = req.query.id;
            console.log('ID:', id);

            const userData = await User.findById({ _id: id }).lean();
            console.log('User Data:', userData);

            if (userData) {
                res.render('admin/edit-user', { users: userData, layout: 'admin-layout' });
            } else {
                console.log('User not found');
                res.redirect('/admin/admin-users');
            }
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    updatingUser: async (req, res) => {
        try {
            const id = req.body.id

            const userData = await User.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mobile, is_verified: req.body.verify } })
            res.redirect('/admin/admin-users')
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    blockingUsers: async (req, res) => {
        try {
            const id = req.query.id;
            const userData = await User.findByIdAndUpdate({ _id: id }, { $set: { blocked: true } });
            // Redirect to the admin-users page
            res.redirect('/admin/admin-users');
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    blockedUsers: async (req, res) => {
        try {
            const blockedUserData = await User.find({ is_admin: false, blocked: true }).lean();
            const usersWithSerialNumber = blockedUserData.map((user, index) => ({
                ...user,
                serialNumber: index + 1
            }));
            console.log(usersWithSerialNumber);
            res.render('admin/blocked-users', { layout: "admin-layout", users: usersWithSerialNumber });
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    unblockingUsers: async (req, res) => {
        try {
            const id = req.query.id;
            const userData = await User.findByIdAndUpdate({ _id: id }, { $set: { blocked: false } });
            // Redirect to the admin-users page
            res.redirect('/admin/blocked-users');
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },


    loadingOrdersList: async (req, res) => {
        try {
            let orderDetails = await Order.find().populate('userId').lean();
            console.log(orderDetails, 'orderDetails');

            // Reverse the order of transactions
            orderDetails = orderDetails.reverse();

            const orderHistory = orderDetails.map(history => {
                let createdOnIST = moment(history.date)
                    .tz('Asia/Kolkata')
                    .format('DD-MM-YYYY h:mm A');

                return { ...history, date: createdOnIST, userName: history.userId.name };
            });

            res.render('admin/ordersList', { layout: 'admin-layout', orderDetails: orderHistory });
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    loadingOrdersViews: async (req, res) => {
        try {
            const orderId = req.query.id;


            console.log(orderId, 'orderId');
            const order = await Order.findOne({ _id: orderId })
                .populate({
                    path: 'products.productId',
                    select: 'name price image',
                })


            const createdOnIST = moment(order.date).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
            order.date = createdOnIST;
            const orderdetails = order.products.map((product) => {
                const images = product.productId.image || [];
                const image = images.length > 0 ? images[0] : "";
                return {
                    name: product.productId.name,
                    image: image,

                    price: product.productId.price,
                    quantity: product.quantity,
                    status: order.orderStatus,
                    total: product.total
                };
            });



            const deliveryAddress = {
                name: order.addressDetails.name,
                homeAddress: order.addressDetails.homeAddress,
                city: order.addressDetails.city,
                street: order.addressDetails.street,
                postalCode: order.addressDetails.postalCode,

            };

            const subtotal = order.orderValue;
            const total = order.actualOrderValue
            const discountAmount = order.couponDiscount
            const productDiscount = order.productOfferDiscount
            const categoryDiscount = order.categoryOfferDiscount
            const cancellationStatus = order.cancellationStatus

            console.log(cancellationStatus, 'cancellationStatus');


            console.log(subtotal, 'subtotal');


            console.log(orderdetails, 'orderDetails');
            console.log(deliveryAddress, 'deliveryAddress');

            res.render('admin/ordersView', {
                layout: 'admin-layout',
                orderDetails: orderdetails,
                deliveryAddress: deliveryAddress,
                subtotal: subtotal,
                total: total,
                discountAmount: discountAmount,
                orderId: orderId,
                orderDate: createdOnIST,
                cancellationStatus: cancellationStatus,
                productDiscount: productDiscount,
                categoryDiscount: categoryDiscount
            });
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    cancellingOrderByAdmin: async (requestData) => {
        try {
            const orderId = requestData;
            console.log(orderId, 'orderidddddddddddddd');
            const updateOrder = await Order.findByIdAndUpdate(
                { _id: new ObjectId(orderId) },
                { $set: { orderStatus: "cancelled", cancellationStatus: "cancelled" } },
                { new: true } // This ensures that the updated document is returned
            ).exec();

            console.log(updateOrder, 'updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');

            // Check if the payment method is online and the order value is greater than 0
            if ((updateOrder.paymentMethod === "ONLINE" || updateOrder.paymentMethod === "WALLET") && updateOrder.orderValue > 0) {
                // Check if a wallet exists for the user
                const wallet = await Wallet.findOne({ userId: updateOrder.userId }).exec();

                if (wallet) {
                    // Wallet exists, increment the wallet amount
                    const updatedWallet = await Wallet.findOneAndUpdate(
                        { userId: updateOrder.userId },
                        { $inc: { walletAmount: updateOrder.orderValue } },
                        { new: true }
                    ).exec();

                    console.log(updatedWallet, 'updated wallet with order value');
                } else {
                    // Wallet doesn't exist, create a new wallet with the order value as the initial amount
                    const newWallet = new Wallet({
                        userId: updateOrder.userId,
                        walletAmount: updateOrder.orderValue
                    });

                    const createdWallet = await newWallet.save();
                    console.log(createdWallet, 'created new wallet with order value');
                }
            }

            return updateOrder;
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    rejectingCancelOrderByAdmin: async (requestData) => {
        try {
            const orderId = requestData
            console.log(orderId, 'orderidddddddddddddd');
            const updateOrder = await Order.findByIdAndUpdate(
                { _id: new ObjectId(orderId) },
                { $set: { orderStatus: "Placed", cancellationStatus: "Not requested" } },
                { new: true } // This ensures that the updated document is returned
            ).exec();

            console.log(updateOrder, 'updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');

            return updateOrder;
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    preparingOrderByAdmin: async (requestData) => {
        try {
            const orderId = requestData
            console.log(orderId, 'orderidddddddddddddd');
            const updateOrder = await Order.findByIdAndUpdate(
                { _id: new ObjectId(orderId) },
                { $set: { orderStatus: "Preparing food", cancellationStatus: "Preparing food" } },
                { new: true } // This ensures that the updated document is returned
            ).exec();

            console.log(updateOrder, 'updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');

            return updateOrder;
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    deliveredOrderByAdmin: async (requestData) => {
        try {
            const orderId = requestData
            console.log(orderId, 'orderidddddddddddddd');
            const updateOrder = await Order.findByIdAndUpdate(
                { _id: new ObjectId(orderId) },
                { $set: { orderStatus: "Delivered", cancellationStatus: "Delivered" } },
                { new: true } // This ensures that the updated document is returned
            ).exec();

            console.log(updateOrder, 'updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');

            return updateOrder;
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },





}