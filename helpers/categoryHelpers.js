const Category = require('../models/categoryModel');
const Product = require('../models/productsModel');
const multer = require('multer')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require("randomstring");
var path = require('path');
const fs = require('fs')


module.exports = {
    loadingCategory: async (req, res) => {
        try {
            const updatedCategories = await Category.find().lean();
            const categoryWithSerialNumber = updatedCategories.map((category, index) => ({
                ...category,
                serialNumber: index + 1
            }));
            res.render('admin/category', { layout: "admin-layout", category: categoryWithSerialNumber });
        } catch (error) {
            throw new Error(error.message);
        }
    },

    addingNewCategory: async (req, res) => {
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
            throw new Error(error.message);
        }
    },

    removingCategory: async (req, res) => {
        try {
            const id = req.query.id;

            // Find the category to be removed
            const category = await Category.findById(id).lean();
            const products = category.products;

            // Delete the products belonging to the category
            await Product.deleteMany({ _id: { $in: products } });

            // Remove the category
            await Category.deleteOne({ _id: id });



            res.redirect('/admin/category');
        } catch (error) {
            throw new Error(error.message);
        }
    }
}