const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyUser, verifySeller, verifyAdmin } = require("../middlewares/auth.middleware");
const { loginRateLimit } = require("../middlewares/rate_limit.middleware");
const validate = require("../middlewares/validate.middleware");
const {
    userSignupSchema,
    userLoginSchema,
    userUpdateSchema
} = require("../validators/user.validator");

router.post(
    "/signup",
    validate(userSignupSchema),
    userController.signup
);

router.post(
    "/login",
    loginRateLimit,
    validate(userLoginSchema),
    userController.login
);

router.post(
    "/logout",
    verifyUser,
    userController.logout
);

router.get(
    "/profile",
    verifyUser,
    userController.getProfile
);

router.put(
    "/profile",
    verifyUser,
    validate(userUpdateSchema),
    userController.updateProfile
);

router.delete(
    "/profile",
    verifyUser,
    userController.deactivateProfile
);

router.post(
    "/onboard-stripe", 
    verifyUser,
    userController.onboardStripe
);

router.get(
    "/admin/getUser",
    verifyAdmin,
    userController.getUser
);

router.get(
    "/seller/getUser",
    verifySeller,
    userController.getUser
);

router.get(
    "/admin/getUser",
    verifyAdmin,
    userController.getUser
);

router.get(
    "/admin/getUserDelete",
    verifySeller,
    userController.getUser
);

module.exports = router;