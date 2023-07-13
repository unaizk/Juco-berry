const offerHelpers = require('../helpers/offerHelpers')

/*========================================================================================================================
                       ==================== ADMIN SIDE PRODUCT OFFER CONTROLLERS ====================
==========================================================================================================================*/

const setProductOfferPOST = async(req,res)=>{
    try {
        

        const productId = req.body.productId;

        const productOfferPercentage = parseInt(req.body.productOfferPercentage);

        const updateProductOffer = offerHelpers.setProductOffer( productId, productOfferPercentage );

        res.redirect("/admin/products")
    } catch (error) {
        console.log("Error from setProductOfferPOST offerController: ", error);
    
        res.redirect('/admin/admin-error');
    }
}

const removeProductOfferPOST = async(req,res)=>{
    try {
        
        const productId = req.body.productId;

        const productOfferPercentage = 0;

        const updateProductOffer = offerHelpers.setProductOffer( productId, productOfferPercentage );

        res.redirect("/admin/products")

    } catch (error) {
        console.log("Error from removeProductOfferPOST offerController: ", error);
    
        res.redirect('/admin/admin-error');
    }
}

const setCategoryOfferPOST = async(req,res)=>{
    try {
        const categoryId = req.body.categoryId;

        const categoryOfferPercentage = parseInt(req.body.categoryOfferPercentage);

        const updateProductOffer = offerHelpers.setCategoryOffer( categoryId, categoryOfferPercentage );

        res.redirect("/admin/category")

    } catch (error) {

        console.log("Error from setCategoryOfferPOST offerController: ", error);
    
        res.redirect('/admin/admin-error');
    }
}

const removeCategoryOfferPOST = async(req,res)=>{
    try {

        const categoryId = req.body.categoryId;

        const categoryOfferPercentage = 0;

        const updateCategoryOffer = offerHelpers.setCategoryOffer( categoryId, categoryOfferPercentage );

        res.redirect("/admin/category")

    } catch (error) {
          console.log("Error from removeCategoryOfferPOST offerController: ", error);
    
        res.redirect('/admin/admin-error');
    }
}

module.exports = {
    setProductOfferPOST,
    removeProductOfferPOST,
    setCategoryOfferPOST,
    removeCategoryOfferPOST
}