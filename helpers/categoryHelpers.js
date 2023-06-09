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
            const updatedCategories = await Category.find({ unlist: false }).lean();
            const categoryWithSerialNumber = updatedCategories.map((category, index) => ({
                ...category,
                serialNumber: index + 1
            }));
            res.render('admin/category', { layout: "admin-layout", category: categoryWithSerialNumber });
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
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
                category: category,
                categoryOffer:0
            });
            const categories = await newCategory.save();


            // Redirect to the category page on successful addition
            return res.redirect('/admin/category');
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },



    unlistingCategory: async (req, res) => {
        try {
            const id = req.query.id;
            // Find the category to be unlist
          

            // unlist the category
            await Category.findByIdAndUpdate({ _id: id }, { $set: { unlist: true } });



            res.redirect('/admin/category');

        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    unlistedCategoryList: async (req, res) => {
        try {
            const unlistedCategoryData = await Category.find({ unlist: true }).lean();
            const categoryWithSerialNumber = unlistedCategoryData.map((category, index) => ({
                ...category,
                serialNumber: index + 1
            }));
            console.log(categoryWithSerialNumber);
            const categories = await Category.find().lean();
            res.render('admin/unlisted-category', { layout: "admin-layout", category: categoryWithSerialNumber, categories: categories });
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    listingCategory: async (req, res) => {
        try {
            const id = req.query.id;
           
            await Category.findByIdAndUpdate({ _id: id }, { $set: { unlist: false } });
            return res.redirect('/admin/unlisted-category');
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    editingCategoryPageLoad: async(req,res)=>{
        try {
            const id = req.query.id;
            console.log('ID:', id);

            const categoryData = await Category.findById({ _id: id }).lean();
            console.log('Category Data:', categoryData);

            if (categoryData) {
                res.render('admin/edit-category', { category: categoryData, layout: 'admin-layout' });
            } else {
                console.log('User not found');
                res.redirect('/admin/category');
            }
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

    updatingCategory: async (req, res) => {
        try {
            const { id, category } = req.body;
    
            // Check if a category with the same name (case-insensitive) already exists
            const existingCategory = await Category.findOne({
                _id: { $ne: id }, // Exclude the current category from the check
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
    
            // Update the category with the new name
            await Category.findByIdAndUpdate(id, { category: category.toUpperCase() });
            res.redirect('/admin/category');
        } catch (error) {
            console.log(error.message)
            res.redirect('/admin/admin-error')
        }
    },

   
    

}