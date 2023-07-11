const Product = require('../models/productsModel');
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
        
    }



}