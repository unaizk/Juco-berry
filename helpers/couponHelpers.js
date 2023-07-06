const config = require('../config/config');
const User = require('../models/userModel');
const Order = require('../models/ordersModel')
const Coupon = require('../models/couponModel')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


module.exports = {
    getActiveCoupons : ()=>{

        return new Promise( async (resolve, reject)=>{
    
            try{
        
                const activeCoupons = await Coupon.find( {activeCoupon:true} ).lean()
        
                resolve(activeCoupons);
        
            }catch (error){
        
                console.log("Error from getActiveCoupons couponHelper :", error);
    
                reject(error);
                
            }
    
        })
        
    },

    getInActiveCoupons:()=>{

        return new Promise( async (resolve, reject)=>{
    
            try{
        
                const inActiveCoupons = await Coupon.find( {activeCoupon:false} ).lean();
        
                resolve(inActiveCoupons);
        
            }catch (error){
        
                console.log("Error from getInActiveCoupons couponHelper :", error);
    
                reject(error);
                
            }
    
        })
        
    },

    verifyCouponExist:(newCouponData)=>{

        return new Promise( async (resolve, reject)=>{
    
            const couponCodeForVerification = newCouponData.couponCode.toLowerCase();
    
            try{
        
                const couponExist = await Coupon.find( { couponCode: couponCodeForVerification } ).lean();
        
                if(couponExist.length === 0){
    
                    resolve({status:true});
    
                }else{
    
                    resolve({duplicateCoupon:true});
                }
        
            }catch (error){
        
                console.log("Error from verifyCouponExist couponHelper :", error);
    
                reject(error);
        
            }
    
        })
        
    },

    addNewCoupon:(newCouponData)=>{

        return new Promise( async (resolve, reject)=>{
    
            try{
                
                console.log(newCouponData,'newCouponDatajjjjjjjjjjj');
                const couponCode = newCouponData.couponCode.toLowerCase(); 
                const usageCount = 0;
                const createdOn = new Date();
                const activeCoupon = newCouponData.activeCoupon === "true"?true:false;
                const couponDescription = newCouponData.couponDescription;
                const discountPercentage = newCouponData.discountPercentage;
                const maxDiscountAmount = newCouponData.maxDiscountAmount;
                const minOrderValue = newCouponData.minOrderValue
                const validFor = newCouponData.validFor
        
                
                const couponData = new Coupon({
                    couponCode:couponCode,
                    couponDescription:couponDescription,
                    discountPercentage:discountPercentage,
                    maxDiscountAmount:maxDiscountAmount,
                    minOrderValue:minOrderValue,
                    validFor:validFor,
                    activeCoupon:activeCoupon,
                    usageCount:usageCount,
                    createdOn:createdOn
                })
                console.log(couponData,'couponDatavvvvvvvvvvvvvvvvvvvvvvv');

                const couponAddition = await couponData.save();

                console.log(couponAddition,'couponAdditionvvvvvvvvvvvvvvvvvvvvvvvvvv');
        
                resolve(couponAddition);
        
            }catch (error){
        
                console.log("Error from addNewCoupon couponHelper :", error);
    
                reject(error);
                
            }
    
        })
        
    }


}