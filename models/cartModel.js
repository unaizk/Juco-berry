const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
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
  ]
});

module.exports = mongoose.model('Cart', cartSchema);