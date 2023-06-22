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
const accountSid = "AC5b08749806fb17d29e70c46231045f1a";
const authToken = "6244609fd966dac7f208bf06003da851";
const verifySid = "VA881219022be56f5c9c40f5b2b336e929";
const twilio = require("twilio")(accountSid, authToken);
const mongoose = require('mongoose');
const { Console } = require('console');
const ObjectId = mongoose.Types.ObjectId;
const Cart = require('../models/cartModel')

module.exports = {
    passwordHash: async (password) => {
        try {
            const hashPassword = await bcrypt.hash(password, 10);
            return hashPassword;
        } catch (error) {
            throw new Error('Failed to hash password');
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
            throw new Error('Failed to send verification email');
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
            throw new Error('Failed to send reset password email');
        }
    },

    loadingSignup: async (req, res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('users/signup&login', { layout: 'user-layout' });
    },

    loadingLogin: async (req, res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('users/signup&login', { layout: 'user-layout' });
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
                throw new Error('Password comparison failed');
            }
        } catch (error) {
            throw new Error('Failed to verify email');
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
                        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                        res.redirect('/home');
                    }
                } else {
                    res.render('users/signup&login', { messages: "Password is incorrect", layout: 'user-layout' });
                }
            } else {
                res.render('users/signup&login', { messages: "Email and password are incorrect", layout: 'user-layout' });
            }
        } catch (error) {
            throw new Error('Failed to verify login');
        }
    },

    loadingHome: async (req, res) => {
        try {
            const productData = await Product.find({ unlist: false }).lean();
            const categories = await Category.find({ unlist: false }).lean()
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.render('users/home', { layout: 'user-layout', products: productData, categories: categories })
        } catch (error) {
            throw new Error(error.message);
        }
    },

    userLoggedOut: async (req, res) => {
        try {
            req.session.destroy();
            res.redirect('/')
        } catch (error) {
            throw new Error(error.message);
        }
    },

    loadingForget: async (req, res) => {
        try {
            res.render('users/forget', { layout: 'user-layout' })
        } catch (error) {
            throw new Error(error.message);
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
            throw new Error(error.message);
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
            throw new Error(error.message);
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
            throw new Error(error.message);
        }
    },

    loadingOTP: async (req, res) => {
        try {
            res.render('users/otp', { layout: 'user-layout' });
        } catch (error) {
            throw new Error(error.message);
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
            throw new Error(error.message);
        }
    },


    loadingVerifyOTP: async (req, res) => {
        try {
            res.render('users/verify-otp', { layout: 'user-layout' })
        } catch (error) {
            throw new Error(error.message);
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
            throw new Error(error.message);
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
            throw new Error(error.message);
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
            res.status(500).json({ error: error.message });
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
            throw new Error(error.message);
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
            console.log(userId,"userId");
            console.log(productId,'productid');
            console.log(quantity,'quantity');
            console.log(cartId,'cartId');
            console.log(count,'count');
            
           
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
        const response = {deleteProduct : true}
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
      console.log(error);
        res.status(500).json({ error: error.message });
     }
    },


    deleteProductFromCart:async(req,res)=>{
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
              console.log(response,'response from userhelper');
              return response;
            } else {
              // Cart or product not found
              const response = { deleteProductFromCart: false };
              console.log(response,'response from userhelper');
              return response;
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        }
    }
}















