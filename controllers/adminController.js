const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');


const loadLogin = async(req,res)=>{
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('admin/admin-login')
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
                res.render('admin/admin-login',{message:"Your are not admin"})
            }else{
                req.session.user_id = userData._id;
                req.session.is_admin = userData.is_admin
                
                res.redirect('admin/admin-home')
            }
        }else{
            res.render('admin/admin-login',{message:"Your password is incorrect"})
        }
       }else{
        res.render('admin/admin-login',{message:"Your email is incorrect"})
       }
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req,res)=>{
    try {
        
        res.render('admin/admin-home',{ layout: "layouts/admin-layout" })
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

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout
}