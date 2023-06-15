const Product = require('../models/productsModel');
const Category = require('../models/categoryModel');
const multer = require('multer')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");
var path = require('path');
const fs = require('fs')
const mongoose = require('mongoose')


module.exports = {
    loadingProductPage: async (req, res) => {
        try {
            const updatedproducts = await Product.find({ unlist: false }).lean();
            const productWithSerialNumber = updatedproducts.map((products, index) => ({
                ...products,
                serialNumber: index + 1,

            }));
            console.log("Retrieving categories...");
            const categories = await Category.find().lean();
            console.log("Categories:", categories);
            res.render('admin/products', { layout: "admin-layout", products: productWithSerialNumber, categories: categories });
        } catch (error) {
            throw new Error(error.message);
        }
    },

    insertingProduct: async (req, res) => {
        try {
            const product = new Product({
                image: req.file.filename,
                name: req.body.name,
                category: req.body.category,
                description: req.body.description,
                price: req.body.price
            })

            const addProduct = await product.save()

            if (addProduct) {
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

                const categories = await Category.find({ unlist: false }).lean();
                res.render('admin/products', { layout: "admin-layout", products: productWithSerialNumber, categories: categories });
            }
        } catch (error) {
            throw new Error(error.message);
        }
    },


    unlistingProducts: async (req, res) => {
        try {
            const id = req.query.id;


            // Find the category of the product
            const product = await Product.findById(id).lean();
            const category = product.category;

            const userData = await Product.findByIdAndUpdate({ _id: id }, { $set: { unlist: true } });

            // Remove the product ID from the category's products array
            await Category.updateOne(
                { category: category },
                { $pull: { products: id } }
            );
            // Retrieve the updated product list
            const updatedProducts = await Product.find({ unlist: false }).lean();
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
            throw new Error(error.message);
        }
    },

    unlistedProductsList: async (req, res) => {
        try {
            const unlistedProductsData = await Product.find({ unlist: true }).lean();
            const productsWithSerialNumber = unlistedProductsData.map((product, index) => ({
                ...product,
                serialNumber: index + 1
            }));
            console.log(productsWithSerialNumber);
            const categories = await Category.find().lean();
            res.render('admin/unlisted-products', { layout: "admin-layout", product: productsWithSerialNumber, categories: categories });
        } catch (error) {
            throw new Error(error.message);
        }
    },



    listingProducts: async (req, res) => {
        try {
            const id = req.query.id;

            // Find the product
            const product = await Product.findById(id).lean();

            const categoryId = product.category;
            console.log(categoryId, "category id");
            // Find the category of the product
            const category = await Category.findOne({ category: categoryId }).lean();
            console.log("categories", category);
            if (!category) {
                // Handle the case where the category is not found
                const errorMessage = 'The category of this product is not found.';
                return res.redirect('/admin/unlisted-products?errorMessage=' + errorMessage);
            }

            if (category.unlist === true) {
                console.log("this worked");
                const errorMessage = 'The category of this product is unlisted, so you cannot list this product.';
                return res.redirect('/admin/unlisted-products?errorMessage=' + errorMessage);
            }

            // Update the unlist field of the product
            await Product.findByIdAndUpdate(id, { unlist: false });

            // Convert the product ID to an ObjectId
            const productId = mongoose.Types.ObjectId.createFromHexString(id);

            // Update the products array field in the category
            await Category.updateOne(
                { category: categoryId },
                { $push: { products: productId } }
            );

            // Retrieve the remaining unlisted products
            const updatedProducts = await Product.find({ unlist: true }).lean();
            const productWithSerialNumber = updatedProducts.map((product, index) => ({
                ...product,
                serialNumber: index + 1,
            }));

            res.redirect('/admin/unlisted-products');
        } catch (error) {
            throw new Error(error.message);
        }
    }




}