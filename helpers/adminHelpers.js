const multer = require('multer')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");
var path = require('path');
const fs = require('fs')
const User = require('../models/userModel');


module.exports = {
    passwordHash: async (password) => {
        try {
            const hashPassword = await bcrypt.hash(password, 10);
            return hashPassword;
        } catch (error) {
            throw new Error('Failed to hash password');
        }
    },

    sendingResetPasswordMail : async(name,email,token)=>{
        try {
            const transporter = nodemailer.createTransport({
                host:'smtp.ethereal.email',
                port:587,
                secure:false,
                requireTLS:true,
                auth:{
                    user:config.emailUser,
                    pass:config.emailPassword
                }
            });
            const mailOption={
                from:'unais5676@gmail.com',
                to:email,
                subject:'To Reset password',
                
                html:'<p> Hi ' +name+', please click here to <a href="http://localhost:3000/admin/admin-forget-password?token='+token+'">Reset </a>your password.</p>'
            }
            transporter.sendMail(mailOption,function(error,info){
                if(error){
                    console.log(error);
                }else{
                    console.log("Your email has been send succefully",info.response);
                }
            })
        } catch (error) {
            throw new Error('Failed to send verification email');
        }
    },

    loadingLogin : async(req,res)=>{
        try {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.render('admin/admin-login',{layout:'admin-layout'})
        } catch (error) {
            throw new Error(error.message);
        }
    },

    verifyingLogin : async(req,res)=>{
        try {
            const email = req.body.email;
            const password = req.body.password;
            
    
            userData = await User.findOne({email:email})
           
           if(userData){
            
            const passwordMatch = await bcrypt.compare(password,userData.password);
            
            if(passwordMatch){
                if(userData.is_admin === false){
                    res.render('admin/admin-login',{layout:'admin-layout',message:'You are not admin'})
                }else{
                    req.session.user_id = userData._id;
                    req.session.is_admin = userData.is_admin
                    
                    res.redirect('admin/admin-home')
                }
            }else{
                res.render('admin/admin-login',{message:"Your password is incorrect",layout:'admin-layout'})
            }
           }else{
            res.render('admin/admin-login',{message:"Your email is incorrect",layout:'admin-layout'})
           }
        } catch (error) {
            throw new Error('Failed to verify login');
        }
    },

    loadingDashboard: async(req,res)=>{
        try {
            res.render('admin/admin-home',{layout:'admin-layout'})
        } catch (error) {
            throw new Error(error.message);
        }
    },

    loggingOut : async(req,res)=>{
        try {
            req.session.destroy();
            res.redirect('admin/admin-login')
        } catch (error) {
            throw new Error(error.message);
        }
    },

    forgetPageLoad : async(req,res)=>{
        try {
            res.render('admin/admin-forget',{layout:'admin-layout'})
        } catch (error) {
            throw new Error(error.message);
        }
    },

    forgetVerifying : async(req,res)=>{
        try {
            const email = req.body.email;
            const userData = await User.findOne({email:email});
            if(userData){
                if(userData.is_admin === false){
                    res.render('admin/admin-forget',{messages:"You are not admin",layout:'admin-layout'})
                }else{
                    const randomString = randomstring.generate()
                    const updatedData = await User.updateOne({email:email},{$set:{token:randomString}})
                    module.exports.sendingResetPasswordMail(userData.name,userData.email,randomString);
                    res.render('admin/admin-forget',{message:"Please check your mail to reset password",layout:'admin-layout'})
                }
            }else{
                res.render('admin/admin-forget',{messages:"Your email is incorrect",layout:'admin-layout'})
            }
        } catch (error) {
            throw new Error(error.message);
        }
    },

    forgetPasswordPageLoad : async(req,res)=>{
        try {
            const token = req.query.token;
            const tokenData = await User.findOne({token:token});
            if(tokenData){
                res.render('admin/admin-forget-password',{user_id:tokenData._id,layout:'admin-layout'})
            }else{
                res.render('admin/admin-404',{layout:'admin-layout'})
            }
        } catch (error) {
            throw new Error(error.message);
        }
    },

    forgetPasswordVerifying : async(req,res)=>{
        try {
            const password = req.body.password;
            const user_id = req.body.user_id;
            const sPassword = await module.exports.passwordHash(password)
            const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:sPassword,token:''}})
            res.redirect('admin/admin-home')
        } catch (error) {
            throw new Error(error.message);
        }
    },

    userListing: async(req,res)=>{
        try {
            const userData = await User.find({ is_admin: false,blocked:false}).lean();
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

    editingUserPageLoad : async(req,res)=>{
        try {
            const id = req.query.id;
            console.log('ID:', id);
    
            const userData = await User.findById({_id: id}).lean();
            console.log('User Data:', userData);
    
            if (userData) {
                res.render('admin/edit-user', {users: userData, layout:'admin-layout'});
            } else {
                console.log('User not found');
                res.redirect('/admin/admin-users');
            }
        } catch (error) {
            throw new Error(error.message);
        }
    },

    updatingUser : async(req,res)=>{
        try {
            const id = req.body.id
        
            const userData = await User.findByIdAndUpdate({_id:id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,is_verified:req.body.verify}})
            res.redirect('/admin/admin-users')
        } catch (error) {
            throw new Error(error.message);
        }
    },

    blockingUsers : async(req,res)=>{
        try {
            const id = req.query.id;
            const userData = await User.findByIdAndUpdate({ _id: id }, {$set:{ blocked: true }});
            // Redirect to the admin-users page
            res.redirect('/admin/admin-users');
        } catch (error) {
            throw new Error(error.message);
        }
    },

    blockedUsers : async(req,res)=>{
        try {
            const blockedUserData = await User.find({ is_admin: false,blocked:true}).lean();
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

    unblockingUsers : async(req,res)=>{
        try {
            const id = req.query.id;
            const userData = await User.findByIdAndUpdate({ _id: id }, {$set:{ blocked: false }});
            // Redirect to the admin-users page
            res.redirect('/admin/blocked-users');
        } catch (error) {
            throw new Error(error.message);
        }
    }



}