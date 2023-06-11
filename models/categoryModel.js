const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category:{
        type:String,
        require:true
    },
    products:{
        type:Array,
        
    }
    
})

module.exports = mongoose.model('Category',categorySchema)