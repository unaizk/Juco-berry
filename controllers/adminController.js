const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");




const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}


const sendResetPasswordMail = async(name,email,token)=>{
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
      console.log(error.message);
    }
}



const loadLogin = async(req,res)=>{
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('admin/admin-login',{layout:'admin-layout'})
    } catch (error) {
        console.log(error.message);
    }
}
const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        

       userData = await User.findOne({email:email})
       
       if(userData){
        
        const passwordMatch = await bcrypt.compare(password,userData.password);
        
        if(passwordMatch){
            if(userData.is_admin === false){
                res.render('admin/admin-login',{layout:'admin-layout'})
            }else{
                req.session.user_id = userData._id;
                req.session.is_admin = userData.is_admin
                
                res.redirect('admin/admin-home')
            }
        }else{
            res.render('admin/admin-login',{message:"Your password is incorrect"},{layout:'admin-layout'})
        }
       }else{
        res.render('admin/admin-login',{message:"Your email is incorrect"},{layout:'admin-layout'})
       }
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req,res)=>{
    try {
        
        res.render('admin/admin-home',{layout:'admin-layout'})
    } catch (error) {
       console.log(error.message); 
    }
}

const logout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('admin/admin-login')
    } catch (error) {
        console.log(error.message);
    }
}

const forgetLoad = async(req,res)=>{
    try {
        res.render('admin/admin-forget',{layout:'admin-layout'})
    } catch (error) {
       console.log(error.message); 
    }
}

const forgetVerify = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if(userData){
            if(userData.is_admin === false){
                res.render('admin/admin-forget',{messages:"You are not admin"},{layout:'admin-layout'})
            }else{
                const randomString = randomstring.generate()
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}})
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('admin/admin-forget',{message:"Please check your mail to reset password"},{layout:'admin-layout'})
            }
        }else{
            res.render('admin/admin-forget',{messages:"Your email is incorrect"},{layout:'admin-layout'})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async(req,res)=>{
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({token:token});
        if(tokenData){
            res.render('admin/admin-forget-password',{user_id:tokenData._id})
        }else{
            res.render('admin/admin-404')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordVerify = async(req,res)=>{
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;
        const sPassword = await securePassword(password)
        const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:sPassword,token:''}})
        res.redirect('admin/admin-home')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    forgetPasswordVerify
}