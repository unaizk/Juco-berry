const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    mobile:{
        type:Number,
        require:true
    },
    is_admin:{
        type:Boolean,
        default:false,
        require:true
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    token:{
        type:String,
        default:''
    },
    blocked:{
        type:Boolean,
        default:false
    }
})


module.exports = mongoose.model('User',userSchema)
