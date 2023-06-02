const User = require('../models/userModel')

const loadSignup = async(req,res)=>{
    try {
        console.log('load signup function is called');
        res.render('users/signup')
    } catch (error) {
        console.log(error.message);
    }
}
const indexPage = async (req, res) => {
    try {
        res.render('index', { title: 'Juco berry' });
    } catch (error) {
        console.log(error.message);
    }
};


module.exports={
    loadSignup,
    indexPage
}