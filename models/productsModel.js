const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    image:{
        type:Array,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    unlist : {
        type:Boolean,
        default:false
    }

})

module.exports = mongoose.model('Product',productsSchema)