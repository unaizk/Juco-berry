const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productsModel');
const adminHelpers = require('../helpers/adminHelpers')
const userHelpers = require('../helpers/userHelpers')
const categoryHelpers = require('../helpers/categoryHelpers')
const productHelpers = require('../helpers/productsHelpers')
const couponHelpers = require('../helpers/couponHelpers')
const Coupon = require('../models/couponModel')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const manageCoupon = async(req,res)=>{
    try {
        const admin = req.session.is_admin;
        const adminData = await User.find({is_admin:admin})
        
        console.log(adminData,'adminDatacccccccccccccc');
        const activeCoupons = await couponHelpers.getActiveCoupons();
        const inActiveCoupons = await couponHelpers.getInActiveCoupons();

        const dataToRender = {

            layout: 'admin-layout',
            adminData,
            activeCoupons,
            inActiveCoupons
    
        }
      
        res.render('admin/coupon-manage', dataToRender );
    } catch (error) {
        
    }
}

const addNewCouponGET = async(req,res)=>{
    try {
        const admin = req.session.is_admin;
        const adminData = await User.find({is_admin:admin})

        let couponExistError = false;

        if(req.session.couponExistError){

            couponExistError = req.session.couponExistError;
            
        }
  
        res.render('admin/coupon-add',{ layout: 'admin-layout', adminData, couponExistError });

        delete req.session.couponExistError;
    } catch (error) {
        console.log("Error from addNewCouponGET couponController :", error);
    }
}

const addNewCouponPOST = async(req,res)=>{
    try {
        const admin = req.session.is_admin;
        const adminData = await User.find({is_admin:admin})

        const newCouponData = req.body;
    
        const couponExist = await couponHelpers.verifyCouponExist(newCouponData);

        if(couponExist.status){
            const couponAddingStatus = await couponHelpers.addNewCoupon(newCouponData);
            
    
                res.redirect('/admin/add-coupon');
    
            
    
               
    
               
        
        }else if (couponExist.duplicateCoupon){
    
            req.session.couponExistError = "Coupon code already exist, try some other code"

            res.redirect('/admin/add-coupon');
    
        }
    } catch (error) {
        
    }
}





module.exports ={
    manageCoupon,
    addNewCouponGET,
    addNewCouponPOST
}