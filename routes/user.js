var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')


/* GET home page. */
router.get('/',userController.indexPage);

/*Get signup page */
router.get('/signup',userController.loadSignup);

router.post('/signup',userController.insertUser)

module.exports = router;
