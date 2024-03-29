const Product = require('../models/productsModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const multer = require('multer')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");
var path = require('path');
const fs = require('fs')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;


module.exports = {
  loadingProductPage: async (req, res) => {
    try {
      const updatedProducts = await Product.find({ unlist: false }).lean();
      const adminUser = await User.findOne({is_admin:req.session.is_admin}).lean()

      // Create a lookup object for category names
      const categoryLookup = {};
      const categories = await Category.find().lean();
      categories.forEach((category) => {
        categoryLookup[category._id] = category.category;
      });

      const productWithSerialNumber = updatedProducts.map((product, index) => ({
        ...product,
        serialNumber: index + 1,
        category: categoryLookup[product.category],
      }));

      console.log('Retrieving categories...');
      console.log('Categories:', categories);
      res.render('admin/products', { layout: 'admin-layout', products: productWithSerialNumber, categories: categories,admin:adminUser });
    } catch (error) {
      console.log(error.message)
      res.redirect('/admin/admin-error')
    }
  },



  insertingProduct: async (req, res) => {
    try {
      var arrayImage = [];
      for (let i = 0; i < req.files.length; i++) {
        arrayImage[i] = req.files[i].filename;
      }
      const product = new Product({
        image: arrayImage,
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        productOffer:0

      });

      const addProduct = await product.save();

      if (addProduct) {
        const updatedProducts = await Product.find().lean();

        // Create a lookup object for category names
        const categoryLookup = {};
        const categories = await Category.find().lean();
        categories.forEach((category) => {
          categoryLookup[category._id] = category.category;
        });

        const productWithSerialNumber = updatedProducts.map((product, index) => ({
          ...product,
          serialNumber: index + 1,
          category: categoryLookup[product.category] || 'Unknown Category',
        }));

        res.render('admin/products', { layout: 'admin-layout', products: productWithSerialNumber, categories: categories });
      }
    } catch (error) {
      console.log(error.message)
      res.redirect('/admin/admin-error')
    }
  },



  unlistingProducts: async (req, res) => {
    try {
      const id = req.query.id;

      const adminUser = await User.findOne({is_admin:req.session.is_admin}).lean()


      const userData = await Product.findByIdAndUpdate({ _id: id }, { $set: { unlist: true } });


      // Retrieve the updated product list
      const updatedProducts = await Product.find({ unlist: false }).lean();
      const productWithSerialNumber = updatedProducts.map((product, index) => ({
        ...product,
        serialNumber: index + 1,
      }));

      const categories = await Category.find().lean();



      // Pass the updated product list and categories to the view
      res.render('admin/products', { layout: 'admin-layout', products: productWithSerialNumber, categories: categories,admin:adminUser });
    } catch (error) {
      console.log(error.message)
      res.redirect('/admin/admin-error')
    }
  },

  unlistedProductsList: async (req, res) => {
    try {
      const unlistedProductsData = await Product.find({ unlist: true }).lean();
      const adminUser = await User.findOne({is_admin:req.session.is_admin}).lean()
      const productsWithSerialNumber = unlistedProductsData.map((product, index) => ({
        ...product,
        serialNumber: index + 1
      }));
      console.log(productsWithSerialNumber);
      const categories = await Category.find().lean();
      res.render('admin/unlisted-products', { layout: "admin-layout", product: productsWithSerialNumber, categories: categories ,admin:adminUser});
    } catch (error) {
      console.log(error.message)
      res.redirect('/admin/admin-error')
    }
  },



  listingProducts: async (req, res) => {
    try {
      const id = req.query.id;




      // Update the unlist field of the product
      await Product.findByIdAndUpdate(id, { unlist: false });

      // Convert the product ID to an ObjectId
      const productId = mongoose.Types.ObjectId.createFromHexString(id);



      // Retrieve the remaining unlisted products
      const updatedProducts = await Product.find({ unlist: true }).lean();
      const productWithSerialNumber = updatedProducts.map((product, index) => ({
        ...product,
        serialNumber: index + 1,
      }));

      res.redirect('/admin/unlisted-products');
    } catch (error) {
      console.log(error.message)
      res.redirect('/admin/admin-error')
    }
  },

  editingProductPageLoad: async (req, res) => {
    try {
      const id = req.query.id;
      console.log('ID:', id);
      const adminUser = await User.findOne({is_admin:req.session.is_admin}).lean()
      const categories = await Category.find({ unlist: false }).lean();
      const categoryData = {};
      categories.forEach((data) => {
        categoryData[data._id.toString()] = {
          _id: data._id.toString(),
          category: data.category
        };
      });

      const categoryLookup = {};
      categories.forEach((category) => {
        categoryLookup[category._id.toString()] = category.category;
      });

      const updatedProduct = await Product.findById(id).lean();

      if (updatedProduct) {
        const productWithCategoryName = {
          ...updatedProduct,
          category: categoryLookup[updatedProduct.category]
        };
        console.log(productWithCategoryName, 'productWithCategoryNamevvvv');
        console.log('CategoryData:', categoryData);
        res.render('admin/edit-product', { product: productWithCategoryName, layout: 'admin-layout', categories: categoryData ,admin:adminUser});
      } else {
        console.log('Product not found');
        res.redirect('/admin/products');
      }
    } catch (error) {
      console.log(error.message)
      res.redirect('/admin/admin-error')
    }
  },


  updatingProducts: async (req, res) => {
    try {
      console.log(req.files, 'hi');
      const id = req.query.id;
      console.log(id, '----------------');
      const product = await Product.findById({ _id: new mongoose.Types.ObjectId(req.query.id) }).lean();
      console.log(product, 'product');
      console.log(req.body.category, "coming to updating");


      let categoryId = req.body.category;



      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        // Category is passed as a string, find the corresponding category ID
        const category = await Category.findOne({ category: categoryId }).lean();
        categoryId = category._id;
      }


      let updatedProductData = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: new mongoose.Types.ObjectId(categoryId),
        image: product.image, // Use the previous image data as the starting point
      };
      console.log(updatedProductData, 'updatedProductData');
      if (req.files && req.files.length > 0) {
        updatedProductData.image = req.files.map((file) => file.filename); // Update with the new image filenames
      }

      const product1 = await Product.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(req.query.id) }, { $set: updatedProductData });
      console.log(product1, 'product1');
      res.redirect('/admin/products');
    } catch (error) {
      console.log(error.message)
      res.redirect('/admin/admin-error')
    }
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const products = await Product.find({ unlist: false }).lean()
        resolve(products);
      } catch (error) {
        reject(error);
      }
    });
  }



















}