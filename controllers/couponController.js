const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productsModel');
const adminHelpers = require('../helpers/adminHelpers')
const userHelpers = require('../helpers/userHelpers')
const categoryHelpers = require('../helpers/categoryHelpers')
const productHelpers = require('../helpers/productsHelpers')
const couponHelpers = require('../helpers/couponHelpers')
const Coupon = require('../models/couponModel')
const UsedCoupon = require('../models/usedCouponModel')
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
        console.log(error.message);
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
        console.log(error.message);
    }
}

const inactiveCouponsGET = async(req,res)=>{
    try {
        const admin = req.session.is_admin;
        const adminData = await User.find({is_admin:admin})

        const inActiveCoupons = await couponHelpers.getInActiveCoupons();
    
        const dataToRender = {
    
            layout: 'admin-layout',
            adminData,
            inActiveCoupons
    
        }
      
        res.render('admin/coupon-deactivated', dataToRender );
        
    
    } catch (error) {
        console.log(error.message);
    }
}

const editCouponGET = async(req,res)=>{
    try {
        const admin = req.session.is_admin;
        const adminData = await User.find({is_admin:admin})

        let couponExistError = false;

        if(req.session.couponExistError){

            couponExistError = req.session.couponExistError;
            
        }
        const couponId = req.query.id;
        // console.log(couponId,'couponIddddddddddddddddd');

        const couponData = await couponHelpers.getSingleCouponData(couponId);

        // console.log(couponData,'couponDatabbbbbbbbbbbbbbb');

        const dataToRender = {
            
            layout: 'admin-layout',
            adminData,
            couponExistError,
            couponData

        }
  
        res.render('admin/coupon-edit', dataToRender);

        delete req.session.couponExistError;
    } catch (error) {
        console.log("Error from editCouponPOST couponController :", error);
    }
}

const updateCouponPOST = async (req, res)=>{

    try{

        const admin = req.session.is_admin;
        const adminData = await User.find({is_admin:admin})

        const couponDataForUpdate = req.body;

        const couponId = couponDataForUpdate.couponId;
    
        const couponExist = await couponHelpers.verifyCouponExist(couponDataForUpdate);
    
        if(couponExist.status){
    
            const couponUpdateStatus = await couponHelpers.updateCouponData(couponDataForUpdate,couponId);
    
          
    
                res.redirect('/admin/manage-coupons');
    
        }else if (couponExist.duplicateCoupon){
    
            req.session.couponExistError = "Coupon code already exist, try some other code"

            res.redirect('/admin/edit-coupon/?id='+couponId);
    
        }

    }catch (error){

        console.log("Error-2 from updateCouponPOST couponController :", error);

        

    }
    
}

const changeCouponStatusPOST = async(req,res)=>{
    try {
        const admin = req.session.is_admin;
        const adminData = await User.find({is_admin:admin})

        const couponId = req.body.couponId;
    
        const couponData = await couponHelpers.getSingleCouponData(couponId);

        if(couponData.activeCoupon){
            const couponUpdateStatus = await couponHelpers.changeCouponStatus(couponData, "Deactivate");
            res.redirect('/admin/manage-coupons');
        }else if(!couponData.activeCoupon){
            const couponUpdateStatus = await couponHelpers.changeCouponStatus(couponData, "Activate");
            res.redirect('/admin/inactive-coupons');
        }else{
            console.log("Error-2 from changeCouponStatusPOST Controller: ", couponUpdateStatus);
        }

    } catch (error) {
        console.log("Error-3 from changeCouponStatusPOST couponController :", error);
    }
}


  /*========================================================================================================================
                        ==================== USER SIDE COUPON CONTROLLERS ====================
==========================================================================================================================*/

const applyCouponPOST = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const couponCode  = req.body.couponCodeFromUser.toLowerCase();
        const couponData = await couponHelpers.getCouponDataByCouponCode(couponCode);
        const couponEligible = await couponHelpers.verifyCouponEligibility(couponCode);


        if(couponEligible.status){
            const cartValue = await userHelpers.getCartValue(userId);
            if(cartValue >= couponData.minOrderValue){
                const userEligible = await couponHelpers.verifyCouponUsedStatus(userId, couponData._id);
                if(userEligible.status){
                    const applyNewCoupon = await couponHelpers.applyCouponToCart(userId, couponData._id);
                    if(applyNewCoupon.status){
                        req.session.couponApplied = "Congrats, Coupon applied succesfully";

                        res.redirect('/checkout');
                    }else{
                        req.session.couponInvalidError = "Sorry, Unexpected Error in applying coupon";

                        res.redirect('/checkout');

                    }
                }else{
                    req.session.couponInvalidError = "Coupon already used earlier";

                    res.redirect('/checkout');
                }
            }else{
                req.session.couponInvalidError = "Coupon not applied, purchase minimum for ₹" + couponData.minOrderValue + " to get coupon";

                res.redirect('/checkout');
            }
        }else if (couponEligible.reasonForRejection){
            req.session.couponInvalidError = couponEligible.reasonForRejection;

            res.redirect('/checkout');
        }




    } catch (error) {
        console.log("Error-3 from changeCouponStatusPOST couponController :", error);
    }
}





module.exports ={
    manageCoupon,
    addNewCouponGET,
    addNewCouponPOST,
    inactiveCouponsGET,
    editCouponGET,
    updateCouponPOST,
    changeCouponStatusPOST,
    applyCouponPOST
}