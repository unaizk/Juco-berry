const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')

const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

const loadSignup = async(req,res)=>{
    try {
        console.log('load signup function is called');
        res.render('users/signup')
    } catch (error) {
        console.log(error.message);
    }
}
const indexPage = async (req, res) => {
    try {
        res.render('index', { title: 'Juco berry' });
    } catch (error) {
        console.log(error.message);
    }
};
//for send Mail//

const sendVerifyMail = async(name,email,user_id)=>{

    const verificationId = await bcrypt.hash(email,10)
      try {
        const transporter = nodemailer.createTransport({
            host:'smtp.ethereal.email',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'delmer52@ethereal.email',
                pass:'9VxCU9m62bSutpdXjK'
            }
        });
        const mailOption={
            from:'unais5676@gmail.com',
            to:email,
            subject:'To verify mail',
            
            html:'<p> Hi'+name+', please click here to <a href="http://localhost:3000/verify?id='+verificationId+'&email='+email+'">verify</a>your mail.</p>'
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
            res.render('users/signup',{message:"Your registration has been successfull, Please verify your email"})
        }else{
            res.render('users/signup',{message:"Your registration has been failed"})
        }

    } catch (error) {
        console.log(error.message);
    }
}

// verifying email//

const verifyEmail = async(req,res)=>{

    console.log(req.query.email,req.query.id);

    const verificationStatus = await bcrypt.compare(req.query.email,req.query.id)
    if(verificationStatus){
        try {
            const updateInfo = await User.updateOne({email:req.query.email},{$set:{is_verified:1}}) 
            console.log(updateInfo);
            res.render('users/email-verified')
         } catch (error) {
             console.log(error.message);
         }
    }else{
        console.log("password comparison failed");
    }
}


module.exports={
    loadSignup,
    indexPage,
    insertUser,
    verifyEmail
}