const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productsModel');
const multer = require('multer')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");
var path = require('path');
const fs = require('fs')



const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}


const sendResetPasswordMail = async(name,email,token)=>{
    try {
      const transporter = nodemailer.createTransport({
          host:'smtp.ethereal.email',
          port:587,
          secure:false,
          requireTLS:true,
          auth:{
              user:config.emailUser,
              pass:config.emailPassword
          }
      });
      const mailOption={
          from:'unais5676@gmail.com',
          to:email,
          subject:'To Reset password',
          
          html:'<p> Hi ' +name+', please click here to <a href="http://localhost:3000/admin/admin-forget-password?token='+token+'">Reset </a>your password.</p>'
      }
      transporter.sendMail(mailOption,function(error,info){
          if(error){
              console.log(error);
          }else{
              console.log("Your email has been send succefully",info.response);
          }
      })
    } catch (error) {
      console.log(error.message);
    }
}



const loadLogin = async(req,res)=>{
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.render('admin/admin-login',{layout:'admin-layout'})
    } catch (error) {
        console.log(error.message);
    }
}
const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        

        userData = await User.findOne({email:email})
       
       if(userData){
        
        const passwordMatch = await bcrypt.compare(password,userData.password);
        
        if(passwordMatch){
            if(userData.is_admin === false){
                res.render('admin/admin-login',{layout:'admin-layout',message:'You are not admin'})
            }else{
                req.session.user_id = userData._id;
                req.session.is_admin = userData.is_admin
                
                res.redirect('admin/admin-home')
            }
        }else{
            res.render('admin/admin-login',{message:"Your password is incorrect",layout:'admin-layout'})
        }
       }else{
        res.render('admin/admin-login',{message:"Your email is incorrect",layout:'admin-layout'})
       }
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req,res)=>{
    try {
        
        res.render('admin/admin-home',{layout:'admin-layout'})
    } catch (error) {
       console.log(error.message); 
    }
}

const logout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('admin/admin-login')
    } catch (error) {
        console.log(error.message);
    }
}

const forgetLoad = async(req,res)=>{
    try {
        res.render('admin/admin-forget',{layout:'admin-layout'})
    } catch (error) {
       console.log(error.message); 
    }
}

const forgetVerify = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if(userData){
            if(userData.is_admin === false){
                res.render('admin/admin-forget',{messages:"You are not admin",layout:'admin-layout'})
            }else{
                const randomString = randomstring.generate()
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}})
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('admin/admin-forget',{message:"Please check your mail to reset password",layout:'admin-layout'})
            }
        }else{
            res.render('admin/admin-forget',{messages:"Your email is incorrect",layout:'admin-layout'})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async(req,res)=>{
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({token:token});
        if(tokenData){
            res.render('admin/admin-forget-password',{user_id:tokenData._id})
        }else{
            res.render('admin/admin-404')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordVerify = async(req,res)=>{
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;
        const sPassword = await securePassword(password)
        const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:sPassword,token:''}})
        res.redirect('admin/admin-home')
    } catch (error) {
        console.log(error.message);
    }
}

const usersList = async (req, res) => {
    try {
        const userData = await User.find({ is_admin: false,blocked:false}).lean();
        const usersWithSerialNumber = userData.map((user, index) => ({
            ...user,
            serialNumber: index + 1
        }));
        console.log(usersWithSerialNumber);
        res.render('admin/admin-users', { layout: "admin-layout", users: usersWithSerialNumber });
    } catch (error) {
        console.log(error.message);
    }
}

const editUserLoad = async (req, res) => {
    try {
        const id = req.query.id;
        console.log('ID:', id);

        const userData = await User.findById({_id: id}).lean();
        console.log('User Data:', userData);

        if (userData) {
            res.render('admin/edit-user', {users: userData, layout:'admin-layout'});
        } else {
            console.log('User not found');
            res.redirect('/admin/admin-users');
        }
    } catch (error) {
        console.log('Error:', error.message);
    }
};

const updateUser = async(req,res)=>{
    try {
        const id = req.body.id
        
       const userData = await User.findByIdAndUpdate({_id:id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,is_verified:req.body.verify}})
       res.redirect('/admin/admin-users')
    } catch (error) {
       console.log(error.message); 
    }
}



const blockingUser = async (req, res) => {
    try {
      const id = req.query.id;
      const userData = await User.findByIdAndUpdate({ _id: id }, {$set:{ blocked: true }});
      // Redirect to the admin-users page
      res.redirect('/admin/admin-users');
    } catch (error) {
      console.log(error.message);
    }
  };

  const blockedUsers = async(req,res)=>{
    try {
        const blockedUserData = await User.find({ is_admin: false,blocked:true}).lean();
        const usersWithSerialNumber = blockedUserData.map((user, index) => ({
            ...user,
            serialNumber: index + 1
        }));
        console.log(usersWithSerialNumber);
        res.render('admin/blocked-users', { layout: "admin-layout", users: usersWithSerialNumber });
    } catch (error) {
        console.log(error.message);
    }
  }
  const unblockingUser = async (req, res) => {
    try {
      const id = req.query.id;
      const userData = await User.findByIdAndUpdate({ _id: id }, {$set:{ blocked: false }});
      // Redirect to the admin-users page
      res.redirect('/admin/blocked-users');
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadCategory = async (req, res) => {
    try {
      const updatedCategories = await Category.find().lean();
      const categoryWithSerialNumber = updatedCategories.map((category, index) => ({
        ...category,
        serialNumber: index + 1
      }));
      res.render('admin/category', { layout: "admin-layout", category: categoryWithSerialNumber });
    } catch (error) {
      console.log(error.message);
    }
  }
  

  const addCategory = async (req, res) => {
    try {
      const category = req.body.category.toUpperCase()
  
      // Check if a category with the same name (case-insensitive) already exists
      const existingCategory = await Category.findOne({
        category: { $regex: new RegExp('^' + category + '$', 'i') }
      });
  
      if (existingCategory) {
        const errorMessage = 'Category already exists.';
        const updatedCategories = await Category.find().lean();
        const categoryWithSerialNumber = updatedCategories.map((category, index) => ({
            ...category,
            serialNumber: index + 1,
          }));
  
        return res.render('admin/category', {
          layout: "admin-layout",
          category: categoryWithSerialNumber,
          error: errorMessage
        });
      }
  
      const newCategory = new Category({
        category: category
      });
      const categories = await newCategory.save();
      
  
      // Redirect to the category page on successful addition
      return res.redirect('/admin/category');
    } catch (error) {
      console.log(error.message);
      // Handle other errors here
    }
  };

  const removeCategory = async (req, res) => {
    try {
      const id = req.query.id;
  
      // Find the category to be removed
      const category = await Category.findById(id).lean();
      const products = category.products;
  
      // Remove the category
      await Category.deleteOne({ _id: id });
  
      // Remove the category from the products' category field
      await Product.updateMany(
        { _id: { $in: products } },
        { $unset: { category: "" } }
      );
  
      res.redirect('/admin/category');
    } catch (error) {
      console.log(error.message);
    }
  }

  const loadProducts = async(req,res)=>{
    try {
        const updatedproducts = await Product.find().lean();
      const productWithSerialNumber = updatedproducts.map((products, index) => ({
        ...products,
        serialNumber: index + 1,
        
      }));
      const categories = await Category.find().lean()
      res.render('admin/products',{layout:"admin-layout",products: productWithSerialNumber,categories:categories });
    } catch (error) {
        console.log(error.message);
    }
  }

  const insertProducts = async(req,res)=>{
    try {
        const product = new Product({
            image:req.file.filename,
            name:req.body.name,
            category:req.body.category,
            description:req.body.description,
            price:req.body.price
        })

        const addProduct = await product.save()
        
        if(addProduct){
             // Update categories collection with the product ID
                await Category.updateOne(
                { category: req.body.category },
                { $push: { products: product._id } }
                );
            const updatedProducts = await Product.find().lean();
            const productWithSerialNumber = updatedProducts.map((product, index) => ({
            ...product,
            serialNumber: index + 1
        }));
       
        const categories = await Category.find().lean();
        res.render('admin/products', { layout: "admin-layout", products: productWithSerialNumber,categories:categories });
        }
     
    } catch (error) {
        console.log(error.message);
    }
  }

  const deleteProduct = async (req, res) => {
    try {
      const id = req.query.id;
  
      // Find the category of the product
      const product = await Product.findById(id).lean();
      const category = product.category;

      // Remove the product image from the public folder
        const imagePath = path.join(__dirname, '../public/productImages', product.image);
        fs.unlinkSync(imagePath);
  
      // Delete the product
      await Product.findByIdAndDelete(id);
  
      // Remove the product ID from the category's products array
      await Category.updateOne(
        { category: category },
        { $pull: { products: id } }
      );
  
      // Retrieve the updated product list
      const updatedProducts = await Product.find().lean();
      const productWithSerialNumber = updatedProducts.map((product, index) => ({
        ...product,
        serialNumber: index + 1,
      }));
  
      const categories = await Category.find().lean();
  
      // Update the categories with the updated products
      for (const category of categories) {
        const updatedProducts = category.products.filter((productId) =>
          String(productId) !== id
        );
        await Category.findByIdAndUpdate(category._id, { products: updatedProducts });
      }
  
      // Pass the updated product list and categories to the view
      res.render('admin/products', { layout: 'admin-layout', products: productWithSerialNumber, categories: categories });
    } catch (error) {
      console.log(error.message);
    }
  }
  
  
  
  

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    forgetPasswordVerify,
    usersList,
    editUserLoad,
    updateUser,
    blockingUser,
    usersList,
    blockedUsers,
    unblockingUser,
    loadCategory,
    addCategory,
    removeCategory,
    loadProducts,
    insertProducts,
    deleteProduct
}