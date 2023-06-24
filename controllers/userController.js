

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

const accountSid = "AC5b08749806fb17d29e70c46231045f1a";
const authToken = "524284ec82c67ab3d82fd72ddd53a2f7";
const verifySid = "VA881219022be56f5c9c40f5b2b336e929";
const twilio = require("twilio")(accountSid, authToken);


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

const viewProduct = async(req,res)=>{
    try {
        await userHelpers.viewProductDetails(req,res);
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async(req,res)=>{
    try {
        await userHelpers.addingToCart(req,res)
    } catch (error) {
        console.log(error.message);
    }
}

const loadCart = async(req,res)=>{
    try {
        await userHelpers.loadingCartPage(req,res);
    } catch (error) {
        console.log(error.message);
    }
}

const changeQuantity = async(req,res)=>{
    try {
       const response = await userHelpers.changeProductQuantity(req,res);
        res.send(response)
    } catch (error) {
        console.log(error.message);
    }
}

const deleteProduct = async(req,res)=>{
    try {
        const response = await userHelpers.deleteProductFromCart(req,res);
        res.send(response)
    } catch (error) {
        console.log(error.message);
    }
}

const userProfile = async(req,res)=>{
    try {
        await userHelpers.loadUserProfile(req,res);
    } catch (error) {
        console.log(error.message);
    }
}

const editProfile = async(req,res)=>{
    try {
        await userHelpers.editingUserProfile(req,res);
    } catch (error) {
        console.log(error.message);
    }
}

const addressList = async(req,res)=>{
    try {
        await userHelpers.loadAddressList(req,res);
    } catch (error) {
        console.log(error.message);
    }
}

const addAddress = async(req,res)=>{
    try {
        await userHelpers.addingAddress(req,res);
    } catch (error) {
        console.log(error.message);
    }
}

const deleteAddress = async(req,res)=>{
    try {
        await userHelpers.deletingAddress(req,res)
    } catch (error) {
        console.log(error.message);
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
    deleteAddress
}