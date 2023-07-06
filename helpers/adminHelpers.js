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
const moment = require("moment-timezone");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
    passwordHash: async (password) => {
        try {
            const hashPassword = await bcrypt.hash(password, 10);
            return hashPassword;
        } catch (error) {
            throw new Error('Failed to hash password');
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
            throw new Error('Failed to send verification email');
        }
    },

    loadingLogin: async (req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.render('admin/admin-login', { layout: 'admin-layout' })
        } catch (error) {
            throw new Error(error.message);
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
            throw new Error('Failed to verify login');
        }
    },

    loadingDashboard: async (req, res) => {
        try {
            res.render('admin/admin-home', { layout: 'admin-layout' })
        } catch (error) {
            throw new Error(error.message);
        }
    },

    loggingOut: async (req, res) => {
        try {
            req.session.destroy();
            res.redirect('admin/admin-login')
        } catch (error) {
            throw new Error(error.message);
        }
    },

    forgetPageLoad: async (req, res) => {
        try {
            res.render('admin/admin-forget', { layout: 'admin-layout' })
        } catch (error) {
            throw new Error(error.message);
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
            throw new Error(error.message);
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
            throw new Error(error.message);
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
            throw new Error(error.message);
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
            throw new Error(error.message);
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
            throw new Error(error.message);
        }
    },

    updatingUser: async (req, res) => {
        try {
            const id = req.body.id

            const userData = await User.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mobile, is_verified: req.body.verify } })
            res.redirect('/admin/admin-users')
        } catch (error) {
            throw new Error(error.message);
        }
    },

    blockingUsers: async (req, res) => {
        try {
            const id = req.query.id;
            const userData = await User.findByIdAndUpdate({ _id: id }, { $set: { blocked: true } });
            // Redirect to the admin-users page
            res.redirect('/admin/admin-users');
        } catch (error) {
            throw new Error(error.message);
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
            throw new Error(error.message);
        }
    },

    unblockingUsers: async (req, res) => {
        try {
            const id = req.query.id;
            const userData = await User.findByIdAndUpdate({ _id: id }, { $set: { blocked: false } });
            // Redirect to the admin-users page
            res.redirect('/admin/blocked-users');
        } catch (error) {
            throw new Error(error.message);
        }
    },


    loadingOrdersList: async (req, res) => {
        try {
          const orderDetails = await Order.find().populate('userId').lean();
          console.log(orderDetails, 'orderDetails');
      
          const orderHistory = orderDetails.map(history => {
            let createdOnIST = moment(history.date)
              .tz('Asia/Kolkata')
              .format('DD-MM-YYYY h:mm A');
      
            return { ...history, date: createdOnIST, userName: history.userId.name };
          });
      
          res.render('admin/ordersList', { layout: 'admin-layout', orderDetails: orderHistory });
        } catch (error) {
          throw new Error(error.message);
        }
      },

      loadingOrdersViews:async(req,res)=>{
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

            const orderDetails = order.products.map(product => {
                const images = product.productId.image || []; // Set images to an empty array if it is undefined
                const image = images.length > 0 ? images[0] : ''; // Take the first image from the array if it exists

                return {
                    name: product.productId.name,
                    image: image,
                    price: product.productId.price,
                    total: product.total,
                    quantity: product.quantity,
                    status:order.orderStatus
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
            const cancellationStatus = order.cancellationStatus
            console.log(cancellationStatus,'cancellationStatus');


            console.log(subtotal, 'subtotal');
          

            console.log(orderDetails, 'orderDetails');
            console.log(deliveryAddress, 'deliveryAddress');

            res.render('admin/ordersView', {
                layout: 'admin-layout',
                orderDetails: orderDetails,
                deliveryAddress: deliveryAddress,
                subtotal: subtotal,
               
                orderId: orderId,
                orderDate: createdOnIST,
                 cancellationStatus:cancellationStatus,
            });
        } catch (error) {
            throw new Error(error.message);
        }
      },

      cancellingOrderByAdmin:async(requestData)=>{
        try {
            const orderId = requestData
            console.log(orderId,'orderidddddddddddddd');
            const updateOrder = await Order.findByIdAndUpdate(
                { _id:new ObjectId(orderId) },
                { $set: { orderStatus: "cancelled",cancellationStatus:"cancelled" } },
                { new: true } // This ensures that the updated document is returned
              ).exec();
              
            console.log(updateOrder,'updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');

            return updateOrder;
        } catch (error) {
            throw new Error(error.message);
        }
      },

      rejectingCancelOrderByAdmin:async(requestData)=>{
        try {
            const orderId = requestData
            console.log(orderId,'orderidddddddddddddd');
            const updateOrder = await Order.findByIdAndUpdate(
                { _id:new ObjectId(orderId) },
                { $set: { orderStatus: "Placed",cancellationStatus:"Not requested" } },
                { new: true } // This ensures that the updated document is returned
              ).exec();
              
            console.log(updateOrder,'updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');

            return updateOrder;
        } catch (error) {
            throw new Error(error.message);
        }
      },

      preparingOrderByAdmin:async(requestData)=>{
        try {
            const orderId = requestData
            console.log(orderId,'orderidddddddddddddd');
            const updateOrder = await Order.findByIdAndUpdate(
                { _id:new ObjectId(orderId) },
                { $set: { orderStatus: "Preparing food",cancellationStatus:"Preparing food" } },
                { new: true } // This ensures that the updated document is returned
              ).exec();
              
            console.log(updateOrder,'updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');

            return updateOrder;
        } catch (error) {
            throw new Error(error.message);
        }
      },

      deliveredOrderByAdmin:async(requestData)=>{
        try {
            const orderId = requestData
            console.log(orderId,'orderidddddddddddddd');
            const updateOrder = await Order.findByIdAndUpdate(
                { _id:new ObjectId(orderId) },
                { $set: { orderStatus: "Delivered",cancellationStatus:"Delivered" } },
                { new: true } // This ensures that the updated document is returned
              ).exec();
              
            console.log(updateOrder,'updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');

            return updateOrder;
        } catch (error) {
            throw new Error(error.message);
        }
      },

      
      


}