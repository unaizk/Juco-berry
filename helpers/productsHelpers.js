const Product = require('../models/productsModel');
const Category = require('../models/categoryModel');
const multer = require('multer')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");
var path = require('path');
const fs = require('fs')


module.exports = {
    loadingProductPage: async (req, res) => {
        try {
            const updatedproducts = await Product.find().lean();
            const productWithSerialNumber = updatedproducts.map((products, index) => ({
                ...products,
                serialNumber: index + 1,

            }));
            const categories = await Category.find().lean()
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

                const categories = await Category.find().lean();
                res.render('admin/products', { layout: "admin-layout", products: productWithSerialNumber, categories: categories });
            }
        } catch (error) {
            throw new Error(error.message);
        }
    },

    deletingProduct: async (req, res) => {
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
            throw new Error(error.message);
        }
    }
}