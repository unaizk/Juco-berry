const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id && req.session.is_admin === true){}
        else{
           return res.redirect('admin/admin-login')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id && req.session.is_admin === true){
           return res.redirect('admin/admin-home')
        }
        next()
    } catch (error) {
       console.log(error.message); 
    }
}

module.exports = {
    isLogin,
    isLogout
}