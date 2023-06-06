

// Load User model and other dependencies
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");

const accountSid = "AC5b08749806fb17d29e70c46231045f1a";
const authToken = "ecaedf1547d64a557e100f9ecb08113b";
const verifySid = "VA881219022be56f5c9c40f5b2b336e929";
const twilio = require("twilio")(accountSid, authToken);





const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
// signup user method
const loadSignup = async(req,res)=>{
    try {
        y// console.log('load signup function is called');
        res.render('users/signup&login')
        
    } catch (error) {
        console.log(error.message);
    }
}
// login user method
const loadLogin = async(req,res)=>{
    try {
        res.render('users/signup&login')
    } catch (error) {
        console.log(error.message);
    }
}


const sendVerifyMail = async(name,email,user_id)=>{

    const verificationId = await bcrypt.hash(email,10)
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
            subject:'To verify mail',
            
            html:'<p> Hi '+name+', please click here to <a href="http://localhost:3000/verify?id='+verificationId+'&email='+email+'">verify</a>your mail.</p>'
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

const insertUser = async(req,res)=>{
    try {
        
        const spassword = await securePassword(req.body.password)
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            password:spassword,
            is_admin:0
        })
        const userData = await user.save();
        sendVerifyMail(req.body.name,req.body.email,userData._id)
        if(userData){
            res.render('users/signup&login',{message:"Your registration has been successfull, Please verify your email"})
        }else{
            res.render('users/signup&login',{message:"Your registration has been failed"})
        }

    } catch (error) {
        console.log(error.message);
    }
}
//for reset password 
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
            
            html:'<p> Hi ' +name+', please click here to <a href="http://localhost:3000/forget-password?token='+token+'">Reset </a>your password.</p>'
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

// verifying email//

const verifyEmail = async(req,res)=>{

    console.log(req.query.email,req.query.id);

    const verificationStatus = await bcrypt.compare(req.query.email, req.query.id)
    if(verificationStatus){
        try {
            const updateInfo = await User.updateOne({email:req.query.email},{$set:{is_verified:true}}) 
            console.log(updateInfo);
            res.render('users/email-verified')
         } catch (error) {
             console.log(error.message);
         }
    }else{
        console.log("password comparison failed");
    }
}

//verify login

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password
       const userData = await User.findOne({email:email});
       if(userData){
        const passwordMatch = await bcrypt.compare(password,userData.password)
        console.log(passwordMatch);
        console.log(userData);
          if(passwordMatch){
            if(userData.is_verified === false){
                res.render('users/signup&login',{messages:"please verify your mail"})
            }else{
                req.session.user_id = userData._id
                
                res.redirect('/home')
            }
          }else{
            res.render('users/signup&login',{messages:"password is incorrect"})
          }
       }else{
        res.render('users/signup&login',{messages:"Email and password is incorrect"})
       }
    } catch (error) {
        console.log(error.message);
    }
}
const loadHome = async(req,res)=>{
    try {
        res.render('users/home',{ layout: "layouts/user-layout" })
    } catch (error) {
        console.log(error.message);
    }
}


const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/')
    } catch (error) {
        console.log(error.mssage);
    }
}

//forget password

const forgetLoad = async(req,res)=>{
    try {
        res.render('users/forget')
    } catch (error) {
        console.log(error.message);
    }
}
const forgetVerify = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({email:email})
        if(userData){
            if(userData.is_verified===false){
                res.render('users/forget',{message:'please verify your email'})
            }else{
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('users/forget',{message:"Please check your mail to reset your password"})
            }
        }else{
            res.render('users/forget',{message:"User email is incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async(req,res)=>{
    try {
        const token = req.query.token;
       const tokenData = await User.findOne({token:token})
       if(tokenData){
        res.render('users/forget-password',{user_id:tokenData._id})
       }else{
        res.render('users/404',{message:"Your token is invalid"})
       }

    } catch (error) {
        console.log(error.message);
    }
}
const resetPassword = async(req,res)=>{
    try {
        const password = req.body.password;
        const user_id = req.body.user_id
        const secure_password =await securePassword(password);
       const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}})
        res.redirect('/login')
    } catch (error) {
        console.log(error.message);
    }
}
//otp verification

// Load OTP form
const loadOtp = async(req,res)=>{
    try {
        res.render('users/otp');
    } catch (error) {
       console.log(error.message); 
    }
}




const sendOtp = async(req,res)=>{
    try {

       console.log(req.body.mobile);
        let mobile = req.body.mobile;
        
        console.log(mobile);
        
        req.session.userMobileForOtp = req.body.mobile;
        const userData = await User.findOne({mobile:mobile})
        console.log(userData);
        if(userData){
            if(userData.is_verified===true){
                const userMobile = "+91"+mobile;
                twilio.verify.v2
                .services(verifySid)
                .verifications.create({ to: userMobile, channel: "sms" })
                .then((verification) =>{
                    if(verification.status === "pending"){
                      
                        res.render('users/verify-otp')
                        
                    }else{
                        res.render('users/otp',{message:"OTP sending failed"})
                    }  
                })
            }else{
                res.render('users/otp',{message:"You have to verify email before OTP login"})
            }
           
        }else{
            res.render('users/otp',{message:"You have to signup before OTP login"})
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadVerifyOtp = async(req,res)=>{
    try {
        res.render('users/verify-otp')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyOtp = async(req,res)=>{
    try {
        const userMobile = "+91"+req.session.userMobileForOtp
        console.log(userMobile);
        const otp = req.body.otp;
        twilio.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: userMobile, code: otp })
            .then(async(verification_check) =>{
                if(verification_check.status === 'approved'){
                    console.log(verification_check.status)
                let user = await User.findOne({mobile:req.session.userMobileForOtp})

                req.session.user_id = user._id;

                console.log(req.session.user_id);

                res.redirect('/home');
                }else{
                    res.render('users/verify-otp',{message:"invalid OTP"})
                }
                
            }) 
            
            }

     catch (error) {
        console.log(error.message);
    }
}
    
        

module.exports={
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
    verifyOtp
}