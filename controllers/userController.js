const User = require('../models/userModel')
const bcrypt = require('bcrypt');

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

        if(userData){
            res.render('users/signup',{message:"Your registration has been successfull, Please verify your email"})
        }else{
            res.render('users/signup',{message:"Your registration has been failed"})
        }

    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    loadSignup,
    indexPage,
    insertUser
}