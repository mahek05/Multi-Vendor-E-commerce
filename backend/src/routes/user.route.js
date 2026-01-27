const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate.middleware");
const {
    userSignupSchema,
    userLoginSchema,
    updateProfileSchema
} = require("../validators/user.validator");
const userController = require("../controllers/user.controller");
const { verifyUser } = require("../middlewares/auth.middleware");
const { loginRateLimit } = require("../middlewares/rate_limit.middleware");

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
    validate(updateProfileSchema),
    userController.updateProfile
);

router.delete(
    "/profile",
    verifyUser,
    userController.deactivateProfile
);

module.exports = router;