const User = require('../models/userModel');
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
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.render('users/home', { layout: 'user-layout' })
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
    }



};















