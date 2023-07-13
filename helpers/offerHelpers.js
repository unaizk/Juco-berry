const Product = require('../models/productsModel');
const Category = require('../models/categoryModel');
const Cart = require('../models/cartModel')

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

/*========================================================================================================================
                       ==================== ADMIN SIDE PRODUCT OFFER HELPERS ====================
==========================================================================================================================*/
module.exports = {
    setProductOffer:( productId, percentageOffer )=>{

        return new Promise( async (resolve, reject)=>{
    
            try{
    
                const updateProductDetails = await Product.updateOne({_id:new ObjectId(productId)}, { $set: { productOffer: percentageOffer } });
    
                resolve(updateProductDetails);
        
            }catch (error){
        
                console.error("Error from setProductOffer offer-helpers: ", error);
    
                reject(error);
        
            }
    
        })
        
    },

    
/*========================================================================================================================
                       ==================== ADMIN SIDE CATEGORY OFFER HELPERS ====================
==========================================================================================================================*/

 setCategoryOffer : ( categoryId, percentageOffer )=>{

    return new Promise( async (resolve, reject)=>{
  
      try{
  
        percentageOffer = parseInt(percentageOffer);
  
        const updateCategoryDetails = await Category.updateOne({_id:new ObjectId(categoryId)}, { $set: { categoryOffer: percentageOffer } });
  
        resolve(updateCategoryDetails);
  
      }catch (error){
  
        console.error("Error from setCategoryOffer offer-helpers: ", error);
  
        reject(error);
  
      }
  
    })
      
  },

/*========================================================================================================================
                       ==================== CALCULATING TOTAL PRODUCT OFFER FROM CART ====================
==========================================================================================================================*/
  calculateProductOfferDiscountsForCart:(userId)=>{
   
        return new Promise( async (resolve, reject)=>{
            try {
               
               
                    const cart = await Cart.findOne({ user_id: userId })
                    .populate({
                        path: 'products.productId',
                        populate: { path: 'category', select: 'categoryOffer' },
                    })
                    .lean()
                    .exec();
        
                     //calculating total product offer discount amount
                     let totalProductDiscountAmount = 0
        
        
                     const productDiscounts = cart.products.forEach((item)=>{
                         const quantity = item.quantity
                         const price = item.productId.price;
                         const productOffer = item.productId.productOffer;
        
                         const discountAmount = (quantity * price * productOffer) / 100;
                         totalProductDiscountAmount += discountAmount;
        
                     })

                     console.log(totalProductDiscountAmount,'totalProductDiscountAmountvvvvvvvvv');
                      
        
                        resolve(totalProductDiscountAmount)
            } catch (error) {
                reject(error);
            }
        })
       
  },

  /*========================================================================================================================
                       ==================== CALCULATING TOTAL CATEGORY OFFER FROM CART ====================
==========================================================================================================================*/

  calculateCategoryOfferAmountForCart:(userId)=>{
    return new Promise( async (resolve, reject)=>{
        try {
            const cart = await Cart.findOne({ user_id: userId })
            .populate({
                path: 'products.productId',
                populate: { path: 'category', select: 'categoryOffer' },
            })
            .lean()
            .exec();

             //calculating total category Offer discount amount
             let totalCategoryDiscountAmount = 0

             const categoryDiscounts = cart.products.forEach((item)=>{

                 const actualProductAmount = item.productId.price * item.quantity;
                 const categoryOffer = item.productId.category.categoryOffer

                 const categoryDiscountAmount = (actualProductAmount *categoryOffer) / 100;
                 totalCategoryDiscountAmount += categoryDiscountAmount;

             })

             console.log(totalCategoryDiscountAmount,'totalCategoryDiscountAmountvvvvvvvvvvvvvvvv');
             

             resolve(totalCategoryDiscountAmount)


        } catch (error) {
            reject(error);
        }
    })

  }
  



}