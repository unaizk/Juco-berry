const mongoose = require('mongoose');

const usedCouponSchema =  new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
   usedCoupons: [
    {
      couponId: {
        type: mongoose.Schema.Types.ObjectId, // The type of the product field (e.g., String, ObjectId, etc.)
        ref:"Coupon"
      },
      appliedCoupon: {
        type: Boolean,
        default: false // You can set a default value if needed
      },
      usedCoupon:{
        type: Boolean,
        default: false // You can set a default value if needed
      }
    }
  ] 
   

})

module.exports = mongoose.model('UsedCoupon', usedCouponSchema)