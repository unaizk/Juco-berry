const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  date:{
    type:Date,
    require:true
  },
  orderValue:{
    type:Number,
    require:true
  },
  paymentMethod:{
    type:String,
    require:true
  },
  couponDiscount:{
    type:Number,
    default:0
  },
  productOfferDiscount:{
    type:Number,
    default:0
  },
  categoryOfferDiscount:{
    type:Number,
    default:0
  },
  actualOrderValue:{
    type:Number,
    require:true
  },
  orderStatus:{
    type:String,
    require:true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId, // The type of the product field (e.g., String, ObjectId, etc.)
        ref:"Product"
      },
      quantity: {
        type: Number,
        required: true,
        default: 1 // You can set a default value if needed
      },
      total:{
        type:Number,
        default:0
      }
    }
  ],
  addressDetails: {

  
    
      name: {
        type:String,
        require:true
      
      },
      mobile:{
        type:String,
        require:true
      },
      homeAddress:{
        type:String,
        require:true
      },
      city:{
        type:String,
        require:true
      },
      street:{
        type:String,
        require:true
      },
      postalCode:{
        type:String,
        require:true
      }

},
  
  cancellationStatus:{
    type:String,
    default:"Not requested"
    
  },
  cancelledOrder:{
    type:Boolean,
    default:false
  }

})

module.exports = mongoose.model('Order',ordersSchema )