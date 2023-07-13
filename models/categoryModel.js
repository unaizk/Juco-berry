const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        require: true
    },

    categoryOffer:{
        type: Number,
        default:0
    },

    unlist: {
        type: Boolean,
        default: false
    }

})

module.exports = mongoose.model('Category', categorySchema)