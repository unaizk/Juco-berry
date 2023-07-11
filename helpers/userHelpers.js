const User = require('../models/userModel');
const Category = require('../models/categoryModel')
const Product = require('../models/productsModel')
const multer = require('multer')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");
var path = require('path');
const fs = require('fs')
require('dotenv').config()
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOCKEN;
const verifySid = process.env.VERIFY_SID;

const twilio = require("twilio")(accountSid, authToken);
const mongoose = require('mongoose');
const { Console } = require('console');
const ObjectId = mongoose.Types.ObjectId;
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel');
const Order = require('../models/ordersModel')
const Coupon = require('../models/couponModel')
const couponHelpers = require('../helpers/couponHelpers')
const UsedCoupon = require('../models/usedCouponModel')
const Wallet = require('../models/walletModel')
const moment = require("moment-timezone")
const Razorpay = require('razorpay');
var instance = new Razorpay({
   key_id: process.env.KEY_ID,
   key_secret: process.env.KEY_SECRET,
});

module.exports = {
    passwordHash: async (password) => {
        try {
            const hashPassword = await bcrypt.hash(password, 10);
            return hashPassword;
        } catch (error) {
            
            console.log(error.message,'Failed to hash password');
            res.redirect('/user-error')
        }
    },

    sendingMailToVerify: async (name, email, user_id) => {
        try {
            const verificationId = await bcrypt.hash(email, 10);
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
                subject: 'To verify mail',
                html: `<p> Hi ${name}, please click here to <a href="http://localhost:3000/verify?id=${verificationId}&email=${email}">verify</a> your mail.</p>`
            };
            await transporter.sendMail(mailOption);
            console.log("Your email has been sent successfully");
        } catch (error) {
            
            console.log(error.message,'Failed to send verification email');
            res.redirect('/user-error')
            
        }
    },

    sendResetPasswordMail: async (name, email, token) => {
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
                html: `<p> Hi ${name}, please click here to <a href="http://localhost:3000/forget-password?token=${token}">Reset</a> your password.</p>`
            };
            await transporter.sendMail(mailOption);
            console.log("Your email has been sent successfully");
        } catch (error) {
            
            console.log(error.message,'Failed to send reset password email');
            res.redirect('/user-error')
        }
    },

    loadingSignup: async (req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('users/signup&login', { layout: 'user-layout' });
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
        
    },

    loadingLogin: async (req, res) => {
        try {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('users/signup&login', { layout: 'user-layout' });
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
        
    },

    insertingUser: async (req, res) => {
        try {
            const spassword = await module.exports.passwordHash(req.body.password);
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                password: spassword,
                is_admin: 0
            });
            const userData = await user.save();
           
            await module.exports.sendingMailToVerify(req.body.name, req.body.email, userData._id);
            res.render('users/signup&login', { message: "Your registration has been successful. Please verify your email.", layout: 'user-layout' });
        } catch (error) {
            res.render('users/signup&login', { message: "Your registration has failed.", layout: 'user-layout' });
            throw new Error('Failed to insert user');
        }
    },

    verifyingEmail: async (req, res) => {
        try {
            const verificationStatus = await bcrypt.compare(req.query.email, req.query.id);
            if (verificationStatus) {
                const updateInfo = await User.updateOne({ email: req.query.email }, { $set: { is_verified: true } });
                console.log(updateInfo);
                res.render('users/email-verified', { layout: 'user-layout' });
            } else {
                
                console.log(error.message,'Password comparison failed');
                res.redirect('/user-error')
            }
        } catch (error) {
            
            console.log(error.message,'Failed to verify email');
            res.redirect('/user-error')
        }
    },

    verifyingToLogin: async (req, res) => {
        try {
            const email = req.body.email;
            const password = req.body.password;
            const userData = await User.findOne({ email: email });
            if (userData) {
                const passwordMatch = await bcrypt.compare(password, userData.password);
                if (passwordMatch) {
                    if (userData.is_verified === false) {
                        res.render('users/signup&login', { messages: "Please verify your email", layout: 'user-layout' });
                    } else if (userData.blocked === true) {
                        res.render('users/signup&login', { messages: "User has been blocked", layout: 'user-layout' });
                    } else {
                        req.session.user_id = userData._id;
                        // Check if a wallet exists for the user
                        const wallet = await Wallet.findOne({ userId: userData._id }).exec();
                        if (wallet) {
                            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                            res.redirect('/home');
                        } else {
                            // Wallet doesn't exist, create a new wallet with the order value as the initial amount
                            const newWallet = new Wallet({
                                userId: userData._id,
                                walletAmount: 0
                            });

                            const createdWallet = await newWallet.save();
                            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                            res.redirect('/home');
                        }



                    }
                } else {
                    res.render('users/signup&login', { messages: "Password is incorrect", layout: 'user-layout' });
                }
            } else {
                res.render('users/signup&login', { messages: "Email and password are incorrect", layout: 'user-layout' });
            }
        } catch (error) {
            
            console.log(error.message,'Failed to verify Login');
            res.redirect('/user-error')
        }
    },

    loadingHome: async (req, res) => {
        try {
            const productData = await Product.find({ unlist: false }).lean();
            const categories = await Category.find({ unlist: false }).lean()
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            console.log(categories, 'categoriessssss');
            res.render('users/home', { layout: 'user-layout', products: productData, categories: categories })
        } catch (error) {
            
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    userLoggedOut: async (req, res) => {
        try {
            req.session.destroy();
            res.redirect('/')
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    loadingForget: async (req, res) => {
        try {
            res.render('users/forget', { layout: 'user-layout' })
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    forgetPasswordVerify: async (req, res) => {
        try {
            const email = req.body.email;
            const userData = await User.findOne({ email: email })
            if (userData) {
                if (userData.is_verified === false) {
                    res.render('users/forget', { message: 'please verify your email', layout: 'user-layout' })
                } else {
                    const randomString = randomstring.generate();
                    const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
                    module.exports.sendResetPasswordMail(userData.name, userData.email, randomString);
                    res.render('users/forget', { message: "Please check your mail to reset your password", layout: 'user-layout' })
                }
            } else {
                res.render('users/forget', { message: "User email is incorrect", layout: 'user-layout' })
            }
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    forgetPasswordLoad: async (req, res) => {
        try {
            const token = req.query.token;
            const tokenData = await User.findOne({ token: token })
            if (tokenData) {
                res.render('users/forget-password', { user_id: tokenData._id, layout: "user-layout" })
            } else {
                res.render('users/404', { message: "Your token is invalid", layout: "user-layout" })
            }
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    resettingPassword: async (req, res) => {
        try {
            const password = req.body.password;
            const user_id = req.body.user_id
            const secure_password = await module.exports.passwordHash(password);
            const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } })
            res.redirect('/login')
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    loadingOTP: async (req, res) => {
        try {
            res.render('users/otp', { layout: 'user-layout' });
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    sendingOTP: async (req, res) => {
        try {
            console.log(req.body.mobile);
            let mobile = req.body.mobile;

            console.log(mobile);

            req.session.userMobileForOtp = req.body.mobile;
            const userData = await User.findOne({ mobile: mobile })
            console.log(userData);
            if (userData) {
                if (userData.is_verified === true) {
                    console.log(verifySid,'verifySid');
                    const userMobile = "+91" + mobile;
                    twilio.verify.v2
                        .services(verifySid)
                        .verifications.create({ to: userMobile, channel: "sms" })
                        .then((verification) => {
                            if (verification.status === "pending") {

                                res.render('users/verify-otp', { layout: 'user-layout' })

                            } else {
                                res.render('users/otp', { message: "OTP sending failed", layout: 'user-layout' })
                            }
                        })
                } else {
                    res.render('users/otp', { message: "You have to verify email before OTP login", layout: 'user-layout' })
                }

            } else {
                res.render('users/otp', { message: "You have to signup before OTP login", layout: 'user-layout' })
            }
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },


    loadingVerifyOTP: async (req, res) => {
        try {
            res.render('users/verify-otp', { layout: 'user-layout' })
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    verifyingOtp: async (req, res) => {
        try {
            const userMobile = "+91" + req.session.userMobileForOtp
            console.log(userMobile);
            const otp = req.body.otp;
            twilio.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: userMobile, code: otp })
                .then(async (verification_check) => {
                    if (verification_check.status === 'approved') {
                        console.log(verification_check.status)
                        let user = await User.findOne({ mobile: req.session.userMobileForOtp })

                        req.session.user_id = user._id;

                        console.log(req.session.user_id);

                        res.redirect('/home');
                    } else {
                        res.render('users/verify-otp', { message: "invalid OTP", layout: "user-layout" })
                    }

                });
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },
    viewProductDetails: async (req, res) => {
        try {
            const id = new mongoose.Types.ObjectId(req.query.id);
            const product = await Product.findById(id).lean()
            console.log(id);
            console.log(product);
            res.render('users/view-product', { layout: 'user-layout', products: product });
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    addingToCart: async (req, res) => {
        try {
            const proId = req.body.productId;
            console.log(proId, "id is coming");

            let cart = await Cart.findOne({ user_id: req.session.user_id });

            if (!cart) {
                let newCart = new Cart({ user_id: req.session.user_id, products: [] });
                await newCart.save();
                cart = newCart;
            }

            const existingProductIndex = cart.products.findIndex((product) => {
                return product.productId.toString() === proId;
            });

            if (existingProductIndex === -1) {
                const product = await Product.findById(proId).lean();
                const total = product.price; // Set the initial total to the price of the product
                cart.products.push({
                    productId: proId,
                    quantity: 1,
                    total, // Use the updated total value
                });
            } else {
                cart.products[existingProductIndex].quantity += 1;
                const product = await Product.findById(proId).lean();
                cart.products[existingProductIndex].total += product.price; // Update the total by adding the price of the product
            }

            // Calculate the updated total amount for the cart
            cart.total = cart.products.reduce((total, product) => {
                return total + product.total;
            }, 0);

            await cart.save();
            console.log(cart);

            // Send a response indicating success or any other relevant data
            res.status(200).json({ message: 'Product added to cart successfully' });
        } catch (error) {
            // Handle any errors that occurred during the process
            console.log(error.message);
            res.redirect('/user-error')
        }
    },



    loadingCartPage: async (req, res) => {
        try {
            const check = await Cart.findOne({ user_id: req.session.user_id });
            if (check) {
                const cart = await Cart.findOne({ user_id: req.session.user_id })
                    .populate({
                        path: 'products.productId',
                        populate: { path: 'category', select: 'category' },
                    })
                    .lean()
                    .exec();

                const products = cart.products.map((product) => {
                    const total =
                        Number(product.quantity) * Number(product.productId.price);
                    return {
                        _id: product.productId._id.toString(),
                        name: product.productId.name,
                        category: product.productId.category.category, // Access the category field directly
                        image: product.productId.image,
                        price: product.productId.price,
                        description: product.productId.description,
                        quantity: product.quantity,
                        total,
                        user_id: req.session.user_id,

                    };
                });

                const total = products.reduce(
                    (sum, product) => sum + Number(product.total),
                    0
                );
                const finalAmount = total;
                // Get the total count of products
                const totalCount = products.length;
                res.render('users/cart', {
                    layout: 'user-layout',
                    products,
                    total,
                    totalCount,
                    subtotal: total,
                    finalAmount,
                });
            } else {
                res.render('users/cart', {
                    message: 'Your cart is empty',
                    layout: 'user-layout',
                });
            }
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    changeProductQuantity: async (req, res) => {
        try {
            const userId = new mongoose.Types.ObjectId(req.body.userId);
            const productId = new mongoose.Types.ObjectId(req.body.productId);
            const quantity = req.body.quantity;
            const cartFind = await Cart.findOne({ user_id: userId });
            const cartId = cartFind._id;
            const count = req.body.count;
            console.log(userId, "userId");
            console.log(productId, 'productid');
            console.log(quantity, 'quantity');
            console.log(cartId, 'cartId');
            console.log(count, 'count');


            // Find the cart for the given user and product
            const cart = await Cart.findOneAndUpdate(
                { user_id: userId, 'products.productId': productId },
                { $inc: { 'products.$.quantity': count } },
                { new: true }
            ).populate('products.productId');

            // Update the total for the specific product in the cart
            const updatedProduct = cart.products.find(product => product.productId._id.equals(productId));
            updatedProduct.total = updatedProduct.productId.price * updatedProduct.quantity;
            await cart.save();

            //   Check if the quantity is 0 or less
            if (updatedProduct.quantity <= 0) {
                // Remove the product from the cart
                cart.products = cart.products.filter(product => !product.productId._id.equals(productId));
                await cart.save();
                const response = { deleteProduct: true }
                return response
            }



            // Calculate the new subtotal for all products in the cart
            const subtotal = cart.products.reduce((acc, product) => {
                return acc + product.total;
            }, 0);

            // Prepare the response object
            const response = {
                quantity: updatedProduct.quantity,
                subtotal: subtotal
            };
            console.log(response);
            return response
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },


    deleteProductFromCart: async (req, res) => {
        try {
            const userId = new mongoose.Types.ObjectId(req.body.userId);
            const productId = new mongoose.Types.ObjectId(req.body.productId);

            // Find the cart with the specified user ID and product ID
            const cart = await Cart.findOneAndUpdate(
                { user_id: userId },
                { $pull: { products: { productId: productId } } },
                { new: true } // To return the updated cart document
            );

            if (cart) {
                console.log(cart, 'updated cart');

                // Product successfully removed from the cart
                const response = { deleteProductFromCart: true };
                console.log(response, 'response from userhelper');
                return response;
            } else {
                // Cart or product not found
                const response = { deleteProductFromCart: false };
                console.log(response, 'response from userhelper');
                return response;
            }

        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    loadUserProfile: async (req, res) => {
        try {
            const userId = new mongoose.Types.ObjectId(req.session.user_id);
            console.log(userId, 'userId');

            // Find the user data
            const userData = await User.findOne({ _id: userId }).lean();

            // Find the default address for the user
            const defaultAddress = await Address.findOne({ user_id: userId, 'address.isDefault': true }, { 'address.$': 1 }).lean();
            console.log(defaultAddress, 'defaultAddress');
            if (defaultAddress) {
                res.render('users/user-profile', {
                    layout: 'user-layout',
                    userData,
                    defaultAddress: defaultAddress.address[0]
                });
            } else {
                // Handle the case when there is no default address
                res.render('users/user-profile', { layout: 'user-layout', userData });
                // Or you can redirect the user to a different page or display an error message
            }

        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },


    editingUserProfile: async (req, res) => {
        try {
            console.log(req.files, 'userimage');
            const id = new mongoose.Types.ObjectId(req.session.user_id);
            const userData = await User.findById({ _id: id }).lean();

            if (!userData) {
                throw new Error('User data not found');
            }

            let updatedUserData = {
                image: userData.image, // Use the previous image data as the starting point
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile
            };
            if (req.file) {
                // Check if a new image file is uploaded
                updatedUserData.image = req.file.filename; // Update with the new image filename
            }

            const updatedUser = await User.findByIdAndUpdate({ _id: id }, { $set: updatedUserData }, { new: true });
            res.redirect('/user-profile');
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    loadAddressList: async (req, res) => {
        try {
            const userId = req.session.user_id;
            const userAddress = await Address.findOne({ user_id: userId }).lean().exec();

            if (userAddress) {
                // Check if there is only one address in the array
                if (userAddress.address.length === 1) {
                    // If there is only one address, set it as the default
                    userAddress.address[0].isDefault = true;
                }

                const addressDetails = userAddress.address.map((address) => {
                    return {
                        name: address.name,
                        mobile: address.mobile,
                        homeAddress: address.homeAddress,
                        city: address.city,
                        street: address.street,
                        postalCode: address.postalCode,
                        _id: address._id,
                        isDefault: address.isDefault
                    };
                });

                console.log(addressDetails, 'addressdetails');
                res.render('users/address', { layout: 'user-layout', addressDetails });
            } else {
                res.render('users/address', { layout: 'user-layout', addressDetails: [] });
            }
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },


    addingAddress: async (req, res) => {
        try {
            const userId = req.session.user_id
            const { name, mobile, homeAddress, city, street, postalCode } = req.body;
            console.log(name);
            console.log(mobile);

            console.log(city);
            console.log(street);
            console.log(postalCode);
            const newAddress = {
                name: name,
                mobile: mobile,
                homeAddress: homeAddress,
                city: city,
                street: street,
                postalCode: postalCode,
                isDefault: false, // Set the default flag to false by default
            };

            // Find the user's address document based on the user_id
            let userAddress = await Address.findOne({ user_id: userId });

            if (!userAddress) {
                // If the user doesn't have any address, create a new document
                newAddress.isDefault = true;
                userAddress = new Address({ user_id: userId, address: [newAddress] });
            } else {
                // If the user already has an address, push the new address to the array
                userAddress.address.push(newAddress);
                // Check if there is only one address in the array
                if (userAddress.address.length === 1) {
                    // If there is only one address, set it as the default
                    userAddress.address[0].isDefault = true;
                }
            }

            await userAddress.save(); // Save the updated address document
            console.log(userAddress, 'useraddress');

            res.redirect('/address');

        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    addingNewAddress: async (req, res) => {
        try {
            const userId = req.session.user_id
            const { name, mobile, homeAddress, city, street, postalCode } = req.body;
            console.log(name);
            console.log(mobile);

            console.log(city);
            console.log(street);
            console.log(postalCode);
            const newAddress = {
                name: name,
                mobile: mobile,
                homeAddress: homeAddress,
                city: city,
                street: street,
                postalCode: postalCode,
                isDefault: false, // Set the default flag to false by default
            };

            // Find the user's address document based on the user_id
            let userAddress = await Address.findOne({ user_id: userId });

            if (!userAddress) {
                // If the user doesn't have any address, create a new document
                newAddress.isDefault = true;
                userAddress = new Address({ user_id: userId, address: [newAddress] });
            } else {
                // If the user already has an address, push the new address to the array
                userAddress.address.push(newAddress);
                // Check if there is only one address in the array
                if (userAddress.address.length === 1) {
                    // If there is only one address, set it as the default
                    userAddress.address[0].isDefault = true;
                }
            }

            await userAddress.save(); // Save the updated address document
            console.log(userAddress, 'useraddress');

            res.redirect('/checkout');

        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    deletingAddress: async (req, res) => {
        try {
            const id = req.query.id;
            const userId = req.session.user_id;

            // Find the address with the specified address ID
            const address = await Address.findOne({ user_id: userId });

            // Find the deleted address and check if it is the default address
            const deletedAddress = address.address.find((addr) => addr._id.toString() === id);
            console.log(deletedAddress, 'deletedAddress');
            const isDefaultAddress = deletedAddress && deletedAddress.isDefault;
            console.log(isDefaultAddress, 'isDefaultAddress');

            // Remove the address with the specified ID from the address array
            address.address = address.address.filter(addr => addr._id.toString() !== id);

            // If the deleted address was the default address, set the next available address as the new default
            if (isDefaultAddress && address.address.length > 0) {
                // Find the first non-deleted address and set it as the new default
                const newDefaultAddress = address.address.find(addr => addr._id.toString() !== id);
                if (newDefaultAddress) {
                    newDefaultAddress.isDefault = true;
                }
                console.log(newDefaultAddress, 'newDefaultAddress');
            }

            // Save the updated address
            await address.save();
            res.redirect('/address');
        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    editingAddress: async (req, res) => {
        try {
            const userId = req.session.user_id;
            const { _id, name, mobile, homeAddress, city, street, postalCode } = req.body;
            console.log(_id, 'id');
            console.log(name, 'name');
            console.log(mobile, 'mobile');
            console.log(homeAddress, 'homeAddress');
            console.log(city, 'city');
            console.log(street, 'street');
            console.log(postalCode, 'postalCode');

            const updatedAddress = await Address.findOneAndUpdate(
                { user_id: userId, 'address._id': _id },
                {
                    $set: {
                        'address.$.name': name,
                        'address.$.mobile': mobile,
                        'address.$.homeAddress': homeAddress,
                        'address.$.city': city,
                        'address.$.street': street,
                        'address.$.postalCode': postalCode
                    }
                },
                { new: true }
            );

            if (updatedAddress) {
                console.log('Address updated successfully:', updatedAddress);
                // Redirect or send a response indicating the update was successful
                res.redirect('/address');
            } else {
                console.log('Address not found or not updated');
                // Redirect or send a response indicating the address was not found or not updated
                res.redirect('/address');
            }
        } catch (error) {
            console.error('Error updating address:', error);
            // Handle the error appropriately
            res.redirect('/address');
        }
    },

    settingAsDefault: async (req, res) => {
        try {
            const addressId = req.body.addressId;
            const userId = req.session.user_id;

            // Find the current default address and unset its "isDefault" flag
            await Address.findOneAndUpdate(
                { user_id: userId, 'address.isDefault': true },
                { $set: { 'address.$.isDefault': false } }
            );

            // Set the selected address as the new default address
            const defaultAddress = await Address.findOneAndUpdate(
                { user_id: userId, 'address._id': addressId },
                { $set: { 'address.$.isDefault': true } }
            );

            const response = {
                setDefault: true
            }

            return response

        } catch (error) {
            console.log(error.message);
            res.redirect('/user-error')
        }
    },

    changingTheAddress: async (req, res) => {
        try {
            const addressId = req.body.addressId;
            const userId = req.session.user_id;

            // Find the current default address and unset its "isDefault" flag
            await Address.findOneAndUpdate(
                { user_id: userId, 'address.isDefault': true },
                { $set: { 'address.$.isDefault': false } }
            );

            // Set the selected address as the new default address
            const defaultAddress = await Address.findOneAndUpdate(
                { user_id: userId, 'address._id': addressId },
                { $set: { 'address.$.isDefault': true } }
            );

            res.redirect('/checkout')


        } catch (error) {
            
            console.log(error.message,'Failed to set address as default');
            res.redirect('/user-error')
        }
    },

    loadingCheckoutPage: async (req, res) => {
        try {
            const userId = req.session.user_id;
            console.log(userId, 'id');

            // Find the default address for the user
            const defaultAddress = await Address.findOne(
                { user_id: userId, 'address.isDefault': true },
                { 'address.$': 1 }
            ).lean();

            console.log(defaultAddress, 'default address');

            // Find the user document and extract the address array
            const userDocument = await Address.findOne({ user_id: userId }).lean();
            const addressArray = userDocument.address;
            console.log(addressArray, 'addressArray');

            // Filter the addresses where isDefault is false
            const filteredAddresses = addressArray.filter(address => !address.isDefault);
            console.log(filteredAddresses, 'filteredAddresses');

            // finding cart products //

            const cart = await Cart.findOne({ user_id: req.session.user_id })
                .populate({
                    path: 'products.productId',
                    populate: { path: 'category', select: 'category' },
                })
                .lean()
                .exec();
            if(cart){
                const products = cart.products.map((product) => {
                    const total =
                        Number(product.quantity) * Number(product.productId.price);
                    return {
                        _id: product.productId._id.toString(),
                        name: product.productId.name,
                        category: product.productId.category.category, // Access the category field directly
                        image: product.productId.image,
                        price: product.productId.price,
                        description: product.productId.description,
                        quantity: product.quantity,
                        total,
                        user_id: req.session.user_id,
                    };
                });
    
                const total = products.reduce(
                    (sum, product) => sum + Number(product.total),
                    0
                );
    
    
                let finalAmount = total;
                // Get the total count of products
                const totalCount = products.length;
    
                // Coupon Request configuration
                let couponError = false;
                let couponApplied = false;
    
                if (req.session.couponInvalidError) {
    
                    couponError = req.session.couponInvalidError;
    
                } else if (req.session.couponApplied) {
    
                    couponApplied = req.session.couponApplied;
    
                }
    
                // Existing Coupon Status Validation & Discount amount calculation using couponHelper
    
                let couponDiscount = 0;
    
                const eligibleCoupon = await couponHelpers.checkCurrentCouponValidityStatus(userId, finalAmount);
    
                if (eligibleCoupon.status) {
                    couponDiscount = eligibleCoupon.couponDiscount;
                } else {
                    couponDiscount = 0;
                }
    
                finalAmount = finalAmount - couponDiscount
    
                const walletDetails = await Wallet.findOne({ userId: userId }).lean()
    
                res.render('users/checkout', {
                    layout: 'user-layout',
                    defaultAddress: defaultAddress ? defaultAddress.address[0] : null, // Add a conditional check for defaultAddress
                    filteredAddresses,
                    products,
                    total,
                    totalCount,
                    couponApplied,
                    couponError,
                    couponDiscount,
                    subtotal: finalAmount,
                    walletDetails
    
                });
                delete req.session.couponApplied;
    
                delete req.session.couponInvalidError;
            }else{
                res.redirect('/cart')
            }

           
        } catch (error) {
            console.log("Error from placeOrderGET userController: ", error);
            
            res.redirect('/user-error')
        }
    },

    getProductListForOrders: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const productDetails = await Cart.findOne({ user_id: userId }).lean();
                console.log(productDetails, 'productDetails');
    
                // Calculate the new subtotal for all products in the cart
                const subtotal = productDetails.products.reduce((acc, product) => {
                    return acc + product.total;
                }, 0);
    
                console.log(subtotal, 'subtotal');
    
                const products = productDetails.products.map((product) => ({
                    productId: product.productId,
                    quantity: product.quantity,
                    total: product.total
                }));
                if (products) {
                    resolve(products);
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(error)
            }
           
           
        })


    },
    getCartValue: (userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                const productDetails = await Cart.findOne({ user_id: userId }).lean();
                console.log(productDetails, 'productDetails');
    
                // Calculate the new subtotal for all products in the cart
                const subtotal = productDetails.products.reduce((acc, product) => {
                    return acc + product.total;
                }, 0);
    
                console.log(subtotal, 'subtotal');
    
                if (subtotal) {
                    resolve(subtotal)
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(error)
            }
           
        })
    },

    placingOrder: async (userId, orderData, orderedProducts, totalOrderValue) => {
        return new Promise(async (resolve, reject)=>{
            try {
                let orderStatus
    
                if (orderData['paymentMethod'] === 'COD') {
                    orderStatus = 'Placed'
                } else if (orderData['paymentMethod'] === 'WALLET') {
                    orderStatus = 'Placed'
                } else {
                    orderStatus = 'Pending'
                }
        
                const defaultAddress = await Address.findOne(
                    { user_id: userId, 'address.isDefault': true },
                    { 'address.$': 1 }
                ).lean();
                console.log(defaultAddress, 'default address');
        
                if (!defaultAddress) {
                    console.log('Default address not found');
                    return res.redirect('/address');
                }
        
                const defaultAddressDetails = defaultAddress.address[0];
                const address = {
                    name: defaultAddressDetails.name,
                    mobile: defaultAddressDetails.mobile,
                    homeAddress: defaultAddressDetails.homeAddress,
                    city: defaultAddressDetails.city,
                    street: defaultAddressDetails.street,
                    postalCode: defaultAddressDetails.postalCode
                };
                console.log(address, 'address');
        
        
                const orderDetails = new Order({
                    userId: userId,
                    date: Date(),
                    orderValue: totalOrderValue,
                    couponDiscount: orderData.couponDiscount,
                    paymentMethod: orderData['paymentMethod'],
                    orderStatus: orderStatus,
                    products: orderedProducts,
                    addressDetails: address
                });
        
                const placedOrder = await orderDetails.save();
        
                console.log(placedOrder, 'placedOrder');
        
                // Remove the products from the cart
                await Cart.deleteMany({ user_id: userId });
        
                let dbOrderId = placedOrder._id.toString();
                console.log(dbOrderId, 'order id in stringggggggggggggggggggggggggggg');
                
                resolve(dbOrderId)
            } catch (error) {
                reject(error)
            }
        })
        
       


    },

    walletBalance: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const walletBalance = await Wallet.findOne({ userId: userId })
                resolve(walletBalance)
            } catch (error) {
                reject(err)

            }
        })
    },

    updateWallet: (userId, orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderDetails = await Order.findOne({ _id: orderId });
                const wallet = await Wallet.findOne({ userId: userId });

                if (wallet) {
                    // Subtract orderValue from walletAmount
                    const updatedWalletAmount = wallet.walletAmount - orderDetails.orderValue;

                    // Update the walletAmount in the Wallet collection
                    await Wallet.findOneAndUpdate(
                        { userId: userId },
                        { walletAmount: updatedWalletAmount }
                    );

                    resolve(updatedWalletAmount);
                } else {
                    reject('Wallet not found');
                }
            } catch (error) {
                reject(error);
            }
        });
    },


    // placingOrder: async (req, res) => {
    //     try {
    //         const paymentMethod = req.body.paymentMethod;
    //         console.log(paymentMethod, 'paymentMethod');

    //         const userId = req.session.user_id;
    //         console.log(userId, 'id');

    //         const orderStatus = paymentMethod === "COD" ? "Placed" : "Pending";
    //         console.log(orderStatus, "orderStatus");

    //         // Find the default address for the user
    //         const defaultAddress = await Address.findOne(
    //             { user_id: userId, 'address.isDefault': true },
    //             { 'address.$': 1 }
    //         ).lean();
    //         console.log(defaultAddress, 'default address');

    //         if (!defaultAddress) {
    //             console.log('Default address not found');
    //             return res.redirect('/address');
    //         }

    //         const productDetails = await Cart.findOne({ user_id: userId }).lean();
    //         console.log(productDetails, 'productDetails');

    //         // Calculate the new subtotal for all products in the cart
    //         const subtotal = productDetails.products.reduce((acc, product) => {
    //             return acc + product.total;
    //         }, 0);

    //         console.log(subtotal, 'subtotal');

    //         const products = productDetails.products.map((product) => ({
    //             productId: product.productId,
    //             quantity: product.quantity,
    //             total: product.total
    //         }));
    //         const defaultAddressDetails = defaultAddress.address[0];
    //         const address = {
    //             name: defaultAddressDetails.name,
    //             mobile: defaultAddressDetails.mobile,
    //             homeAddress: defaultAddressDetails.homeAddress,
    //             city: defaultAddressDetails.city,
    //             street: defaultAddressDetails.street,
    //             postalCode: defaultAddressDetails.postalCode
    //         };
    //         console.log(address, 'address');

    //         const orderDetails = new Order({
    //             userId: userId,
    //             date: Date(),
    //             orderValue: subtotal,
    //             paymentMethod: paymentMethod,
    //             orderStatus: orderStatus,
    //             products: products,
    //             addressDetails: address
    //         });

    //         const placedOrder = await orderDetails.save();

    //         console.log(placedOrder, 'placedOrder');

    //         // Remove the products from the cart
    //         await Cart.deleteMany({ user_id: userId });

    //         res.render('users/orderPlaced', { layout: "user-layout", placedOrder });
    //     } catch (error) {
    //         console.error(error);
    //         res.redirect('/address');
    //     }
    // },




    loadOrderDetails: async (req, res) => {
        try {
            const userId = req.session.user_id
            let orderDetails = await Order.find({ userId: userId }).lean()

            // Reverse the order of transactions
            orderDetails = orderDetails.reverse();

            orderHistory = orderDetails.map(history => {
                let createdOnIST = moment(history.date)
                    .tz('Asia/kolkata')
                    .format('DD-MM-YYYY h:mm A');

                return { ...history, date: createdOnIST };
            })

            console.log(orderDetails, 'orderDetails');

            res.render('users/ordersList', { layout: 'user-layout', orderDetails: orderHistory });


        } catch (error) {
            console.log(error.message);
            
            res.redirect('/user-error')
        }
    },

    loadingOrdersViews: async (req, res) => {
        try {
            const orderId = req.query.id;

            const userId = req.session.user_id

            console.log(orderId, 'orderId when loading page');
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
                    status: order.orderStatus,

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
            const total = order.orderValue + order.couponDiscount
            const discountAmount = order.couponDiscount

            const cancellationStatus = order.cancellationStatus
            console.log(cancellationStatus, 'cancellationStatus');

            console.log(subtotal, 'subtotal');


            console.log(orderDetails, 'orderDetails');
            console.log(deliveryAddress, 'deliveryAddress');

            res.render('users/ordersView', {
                layout: 'user-layout',
                orderDetails: orderDetails,
                deliveryAddress: deliveryAddress,
                subtotal: subtotal,
                total: total,
                orderId: orderId,
                discountAmount: discountAmount,
                orderDate: createdOnIST,
                cancellationStatus: cancellationStatus,

            });
        } catch (error) {
            console.log(error.message);
            
            res.redirect('/user-error')
        }
    },


    cancellingOrder: async (requestData) => {
        try {
            const orderId = requestData


            const updateOrder = await Order.findByIdAndUpdate({ _id: new ObjectId(orderId) }, { $set: { cancellationStatus: "cancellation requested" } });

            return updateOrder;


        } catch (error) {
            console.log(error.message);
            
            res.redirect('/user-error')
        }
    },

    generateRazorpayOrder: (orderId, totalOrderValue) => {
        orderValue = totalOrderValue * 100
        // To convert paisa into rupees as the Razorpay takes the amount in smallest currency unit (paisa) 
        // Amount is in currency subunits. Default currency is INR. Hence, 1 refers to 1 paise, so here the amount is multiplied by 100 to convert it to rupees
        return new Promise((resolve, reject) => {
            try {
                let orderDetails = {

                    amount: orderValue,
                    currency: "INR",
                    receipt: orderId
    
                };
                console.log(orderDetails, 'orderdetailssssssssssssssssssssssssssss');
                instance.orders.create(orderDetails, function (err, orderDetails) {
                    if (err) {
                        console.log('Order Creation Error from Razorpay: ' + err);
                        reject(err)
                    } else {
                        resolve(orderDetails);
                    }
                })
            } catch (error) {
                reject(error)
            }
            
        })

    },

    verifyOnlinePayment: (paymentData) => {

        // console.log(paymentData);

        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto'); // Requiring crypto Module here for generating server signature for payments verification

                let razorpaySecretKey = process.env.KEY_SECRET;
    
                let hmac = crypto.createHmac('sha256', razorpaySecretKey); // Hashing Razorpay secret key using SHA-256 Algorithm
    
                hmac.update(paymentData['razorpayServerPaymentResponse[razorpay_order_id]'] + '|' + paymentData['razorpayServerPaymentResponse[razorpay_payment_id]']);
                // Updating the hash (re-hashing) by adding Razprpay payment Id and order Id received from client as response
    
                let serverGeneratedSignature = hmac.digest('hex');
                // Converted the final hashed result into hexa code and saving it as server generated signature
    
                let razorpayServerGeneratedSignatureFromClient = paymentData['razorpayServerPaymentResponse[razorpay_signature]']
    
                if (serverGeneratedSignature === razorpayServerGeneratedSignatureFromClient) {
                    // Checking that is the signature generated in our server using the secret key we obtained by hashing secretkey,orderId & paymentId is same as the signature sent by the server 
    
                    // console.log("Payment Signature Verified");
    
                    resolve()
    
                } else {
    
                    // console.log("Payment Signature Verification Failed");
    
                    reject()
    
                }
            } catch (error) {
                reject(error)
            }

           

        })

    },

    updateOnlineOrderPaymentStatus: (ordersCollectionId, onlinePaymentStatus) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (onlinePaymentStatus) {
                    const orderUpdate = await Order.findByIdAndUpdate({ _id: new ObjectId(ordersCollectionId) }, { $set: { orderStatus: "Placed" } }).then(() => {
                        resolve()
                    });
    
                } else {
                    const orderUpdate = await Order.findByIdAndUpdate({ _id: new ObjectId(ordersCollectionId) }, { $set: { orderStatus: "Failed" } }).then(() => {
                        resolve()
                    })
                }
            } catch (error) {
                reject(error)
            }
           
        })
    },

    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const categories = await Category.find({ unlist: false }).lean()
                resolve(categories);
            } catch (error) {
                reject(error);
            }
        });
    },


    getCategoryByName: (category) => {
        return new Promise(async (resolve, reject) => {
            try {
                const categoryId = await Category.findOne({ category: category }).lean();
                resolve(categoryId);
            } catch (error) {
                reject(error);
            }
        });
    },

    listCategorys: (catId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const categoryProducts = await Product.find({ category: catId, unlist: false }).lean();

                resolve(categoryProducts);
            } catch (error) {
                reject(error);
            }
        });
    },


    getWalletDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const walletDetails = await Wallet.findOne({ userId: userId }).lean()
                // console.log(walletDetails,'walletDetailsvvvvvvvvvvvvvv');


                resolve(walletDetails)
            } catch (error) {
                reject(error);
            }
        })
    },

    creditOrderDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderDetails = await Order.find({
                    userId: userId,
                    $or: [{ paymentMethod: 'ONLINE' }, { paymentMethod: 'WALLET' }],
                    orderStatus: 'cancelled'
                }).lean();

                const orderHistory = orderDetails.map(history => {
                    let createdOnIST = moment(history.date)
                        .tz('Asia/Kolkata')
                        .format('DD-MM-YYYY h:mm A');

                    return { ...history, date: createdOnIST };
                });

                resolve(orderHistory);
            } catch (error) {
                reject(error);
            }
        });
    },

    debitOrderDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderDetails = await Order.find({
                    userId: userId,
                    paymentMethod: 'WALLET',
                    $or: [{ orderStatus: 'Placed' }, { orderStatus: 'Delivered' },{orderStatus:'Preparing food'}],
                  
                }).lean();

                const orderHistory = orderDetails.map(history => {
                    let createdOnIST = moment(history.date)
                        .tz('Asia/Kolkata')
                        .format('DD-MM-YYYY h:mm A');

                    return { ...history, date: createdOnIST };
                });

                resolve(orderHistory);
            } catch (error) {
                reject(error);
            }
        });
    },










}















