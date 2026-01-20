const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const { verifyAdmin } = require("../middlewares/auth.middleware");
const { loginRateLimit } = require("../middlewares/rate_limit.middleware");

const validate = require("../middlewares/validate.middleware");
const {
    adminSignupSchema,
    adminLoginSchema,
    adminUpdateSchema
} = require("../validators/admin.validator")

router.post(
    "/signup",
    validate(adminSignupSchema),
    adminController.signup
);

router.post(
    "/login",
    loginRateLimit,
    validate(adminLoginSchema),
    adminController.login
);

router.post(
    "/logout",
    verifyAdmin,
    adminController.logout
);

router.get(
    "/profile",
    verifyAdmin,
    adminController.getProfile
);
router.put(
    "/profile",
    verifyAdmin,
    validate(adminUpdateSchema),
    adminController.updateProfile
);

router.delete(
    "/profile",
    verifyAdmin,
    adminController.deactivateProfile
);

router.post(
    "/sellerStatus/:id",
    verifyAdmin,
    adminController.sellerStatus
);

router.get(
    "/getSeller",
    verifyAdmin,
    adminController.getSeller
);

router.get(
    "/getUser",
    verifyAdmin,
    adminController.getUser
);

module.exports = router;