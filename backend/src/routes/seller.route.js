const express = require("express");
const router = express.Router();

const sellerController = require("../controllers/seller.controller");
const { verifySeller } = require("../middlewares/auth.middleware");
const { loginRateLimit } = require("../middlewares/rate_limit.middleware");
const validate = require("../middlewares/validate.middleware");
const {
    sellerLoginSchema,
    sellerSignupSchema,
    sellerUpdateSchema
} = require("../validators/seller.validator")

router.post(
    "/signup",
    validate(sellerSignupSchema),
    sellerController.signup
);

router.post(
    "/login", 
    loginRateLimit,
    validate(sellerLoginSchema),
    sellerController.login
);

router.post(
    "/logout", 
    verifySeller, 
    sellerController.logout
);

router.get(
    "/profile", 
    verifySeller, 
    sellerController.getProfile
);

router.put(
    "/profile", 
    verifySeller,
    validate(sellerUpdateSchema),
    sellerController.updateProfile
);

router.delete(
    "/profile", 
    verifySeller, 
    sellerController.deactivateProfile
);

module.exports = router;