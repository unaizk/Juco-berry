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
const adminHelpers = require('../helpers/adminHelpers')
const userHelpers = require('../helpers/userHelpers')
const categoryHelpers = require('../helpers/categoryHelpers')
const productHelpers = require('../helpers/productsHelpers')




const loadLogin = async (req, res) => {
  try {
    adminHelpers.loadingLogin(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}
const verifyLogin = async (req, res) => {
  try {
    await adminHelpers.verifyingLogin(req, res)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const loadDashboard = async (req, res) => {
  try {

    const dashBoardDetails = await adminHelpers.loadingDashboard(req, res)

    const totalUser = dashBoardDetails.totaluser;
    const totalSales = dashBoardDetails.totalSales;
    const salesbymonth = dashBoardDetails.salesbymonth
    const paymentMethod = dashBoardDetails.paymentMethod;
    const yearSales = dashBoardDetails.yearSales
    const todaySales = dashBoardDetails.todaySales
    // console.log(todaySales,'todaySales');
    // console.log(totalUser,'totalUser');
    // console.log(totalSales,'totalSales');
   
    console.log(paymentMethod,'paymentMethod');
    // console.log(yearSales,'yearSales');
   let sales=encodeURIComponent(JSON.stringify(salesbymonth))

   console.log(sales,'sales');

    res.render('admin/admin-home', { layout: 'admin-layout',totalUser,todaySales:todaySales[0] ,totalSales:totalSales[0], salesbymonth:encodeURIComponent(JSON.stringify(salesbymonth)) ,paymentMethod:encodeURIComponent(JSON.stringify(paymentMethod)),yearSales:yearSales[0] })
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const logout = async (req, res) => {
  try {
    adminHelpers.loggingOut(req, res)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const forgetLoad = async (req, res) => {
  try {
    adminHelpers.forgetPageLoad(req, res)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const forgetVerify = async (req, res) => {
  try {
    await adminHelpers.forgetVerifying(req, res)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const forgetPasswordLoad = async (req, res) => {
  try {
    await adminHelpers.forgetPasswordPageLoad(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const forgetPasswordVerify = async (req, res) => {
  try {
    await adminHelpers.forgetPasswordVerifying(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const usersList = async (req, res) => {
  try {
    await adminHelpers.userListing(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const editUserLoad = async (req, res) => {
  try {
    await adminHelpers.editingUserPageLoad(req, res)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
};

const updateUser = async (req, res) => {
  try {
    await adminHelpers.updatingUser(req, res)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const blockingUser = async (req, res) => {
  try {
    await adminHelpers.blockingUsers(req, res)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
};

const blockedUsers = async (req, res) => {
  try {
    await adminHelpers.blockedUsers(req, res)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}
const unblockingUser = async (req, res) => {
  try {
    await adminHelpers.unblockingUsers(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
};

const loadCategory = async (req, res) => {
  try {
    await categoryHelpers.loadingCategory(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}


const addCategory = async (req, res) => {
  try {
    await categoryHelpers.addingNewCategory(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
};

const unlistCategory = async (req, res) => {
  try {
    await categoryHelpers.unlistingCategory(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}
const unlistedCategory = async (req, res) => {
  try {
    await categoryHelpers.unlistedCategoryList(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const listCategory = async (req, res) => {
  try {
    await categoryHelpers.listingCategory(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const loadProducts = async (req, res) => {
  try {
    await productHelpers.loadingProductPage(req, res)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const insertProducts = async (req, res) => {
  try {
    await productHelpers.insertingProduct(req, res);

  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const unlistProduct = async (req, res) => {
  try {
    await productHelpers.unlistingProducts(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const unlistedProducts = async (req, res) => {
  try {
    await productHelpers.unlistedProductsList(req, res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const listProducts = async (req, res) => {
  try {
    await productHelpers.listingProducts(req, res)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const editCategoryLoad = async(req,res)=>{
  try {
    await categoryHelpers.editingCategoryPageLoad(req,res)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const updateCategory = async(req,res)=>{
  try {
    await categoryHelpers.updatingCategory(req,res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const editProductLoad = async(req,res)=>{
  try {
    await productHelpers.editingProductPageLoad(req,res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const updateProduct = async(req,res)=>{
  try {
    await productHelpers.updatingProducts(req,res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const loadOrdersList = async(req,res)=>{
  try {
    await adminHelpers.loadingOrdersList(req,res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const loadOrdersView = async(req,res)=>{
  try {
    await adminHelpers.loadingOrdersViews(req,res);
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const cancelledByAdmin = async(req,res)=>{
  try {
    const id = req.body.orderId
       console.log(id,'idddddddddddddd');

        const url = '/admin/ordersView?id='+ id;
        console.log(url,'urlllllllllllllllllllllllll');
        await adminHelpers.cancellingOrderByAdmin(id);

        res.redirect(url)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const rejectCancellation = async(req,res)=>{
  try {
    const id = req.body.orderId
    console.log(id,'idddddddddddddd');

     const url = '/admin/ordersView?id='+ id;
     console.log(url,'urlllllllllllllllllllllllll');
     await adminHelpers.rejectingCancelOrderByAdmin(id);

     res.redirect(url)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}


const preparingFood = async(req,res)=>{
  try {
    const id = req.body.orderId
    console.log(id,'idddddddddddddd');

     const url = '/admin/ordersView?id='+ id;
     console.log(url,'urlllllllllllllllllllllllll');
     await adminHelpers.preparingOrderByAdmin(id);

     res.redirect(url)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const deliveredFood = async(req,res)=>{
  try {
    const id = req.body.orderId
    console.log(id,'idddddddddddddd');

     const url = '/admin/ordersView?id='+ id;
     console.log(url,'urlllllllllllllllllllllllll');
     await adminHelpers.deliveredOrderByAdmin(id);

     res.redirect(url)
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
  }
}

const errorPageLoad = async(req,res)=>{
  try {
    const userId = req.session.user_id;
    const userDetails = await User.findOne({_id:userId}).lean()
    res.render('admin/admin-error-page',{layout:'admin-layout',userDetails})
  } catch (error) {
    console.log(error.message)
    res.redirect('/admin/admin-error')
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
  unlistCategory,
  loadProducts,
  insertProducts,
  unlistProduct,
  unlistedProducts,
  listProducts,
  unlistedCategory,
  listCategory,
  editCategoryLoad,
  updateCategory,
  editProductLoad,
  updateProduct,
  loadOrdersList,
  loadOrdersView,
  cancelledByAdmin,
  rejectCancellation,
  preparingFood,
  deliveredFood,
  errorPageLoad

}