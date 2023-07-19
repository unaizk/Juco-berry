const User = require('../models/userModel');

const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            const userData = await User.findById(req.session.user_id)
            if(userData && !userData.blocked){
                next();
            }else{
                delete req.session.user_id
                return res.redirect('/login')
            }
        }
        else{
            
           return res.redirect('/login')
        }
        
    } catch (error) {
       console.log(error.message); 
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
          return  res.redirect('/home')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}


module.exports ={
    isLogin,
    isLogout
}