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
    console.log(error.message);
  }
}
const verifyLogin = async (req, res) => {
  try {
    await adminHelpers.verifyingLogin(req, res)
  } catch (error) {
    console.log(error.message);
  }
}

const loadDashboard = async (req, res) => {
  try {

    adminHelpers.loadingDashboard(req, res)
  } catch (error) {
    console.log(error.message);
  }
}

const logout = async (req, res) => {
  try {
    adminHelpers.loggingOut(req, res)
  } catch (error) {
    console.log(error.message);
  }
}

const forgetLoad = async (req, res) => {
  try {
    adminHelpers.forgetPageLoad(req, res)
  } catch (error) {
    console.log(error.message);
  }
}

const forgetVerify = async (req, res) => {
  try {
    await adminHelpers.forgetVerifying(req, res)
  } catch (error) {
    console.log(error.message);
  }
}

const forgetPasswordLoad = async (req, res) => {
  try {
    await adminHelpers.forgetPasswordPageLoad(req, res);
  } catch (error) {
    console.log(error.message);
  }
}

const forgetPasswordVerify = async (req, res) => {
  try {
    await adminHelpers.forgetPasswordVerifying(req, res);
  } catch (error) {
    console.log(error.message);
  }
}

const usersList = async (req, res) => {
  try {
    await adminHelpers.userListing(req, res);
  } catch (error) {
    console.log(error.message);
  }
}

const editUserLoad = async (req, res) => {
  try {
    await adminHelpers.editingUserPageLoad(req, res)
  } catch (error) {
    console.log('Error:', error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    await adminHelpers.updatingUser(req, res)
  } catch (error) {
    console.log(error.message);
  }
}

const blockingUser = async (req, res) => {
  try {
    await adminHelpers.blockingUsers(req, res)
  } catch (error) {
    console.log(error.message);
  }
};

const blockedUsers = async (req, res) => {
  try {
    await adminHelpers.blockedUsers(req, res)
  } catch (error) {
    console.log(error.message);
  }
}
const unblockingUser = async (req, res) => {
  try {
    await adminHelpers.unblockingUsers(req, res);
  } catch (error) {
    console.log(error.message);
  }
};

const loadCategory = async (req, res) => {
  try {
    await categoryHelpers.loadingCategory(req, res);
  } catch (error) {
    console.log(error.message);
  }
}


const addCategory = async (req, res) => {
  try {
    await categoryHelpers.addingNewCategory(req, res);
  } catch (error) {
    console.log(error.message);
    // Handle other errors here
  }
};

const unlistCategory = async (req, res) => {
  try {
    await categoryHelpers.unlistingCategory(req, res);
  } catch (error) {
    console.log(error.message);
  }
}
const unlistedCategory = async (req, res) => {
  try {
    await categoryHelpers.unlistedCategoryList(req, res);
  } catch (error) {
    console.log(error.message);
  }
}

const listCategory = async (req, res) => {
  try {
    await categoryHelpers.listingCategory(req, res);
  } catch (error) {
    console.log(error.message);
  }
}

const loadProducts = async (req, res) => {
  try {
    await productHelpers.loadingProductPage(req, res)
  } catch (error) {
    console.log(error.message);
  }
}

const insertProducts = async (req, res) => {
  try {
    await productHelpers.insertingProduct(req, res);

  } catch (error) {
    console.log(error.message);
  }
}

const unlistProduct = async (req, res) => {
  try {
    await productHelpers.unlistingProducts(req, res);
  } catch (error) {
    console.log(error.message);
  }
}

const unlistedProducts = async (req, res) => {
  try {
    await productHelpers.unlistedProductsList(req, res);
  } catch (error) {
    console.log(error.message);
  }
}

const listProducts = async (req, res) => {
  try {
    await productHelpers.listingProducts(req, res)
  } catch (error) {
    console.log(error.message);
  }
}

const editCategoryLoad = async(req,res)=>{
  try {
    await categoryHelpers.editingCategoryPageLoad(req,res)
  } catch (error) {
    console.log(error.message);
  }
}

const updateCategory = async(req,res)=>{
  try {
    await categoryHelpers.updatingCategory(req,res);
  } catch (error) {
    console.log(error.message);
  }
}

const editProductLoad = async(req,res)=>{
  try {
    await productHelpers.editingProductPageLoad(req,res);
  } catch (error) {
    console.log(error.message);
  }
}

const updateProduct = async(req,res)=>{
  try {
    await productHelpers.updatingProducts(req,res);
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
  updateProduct
}