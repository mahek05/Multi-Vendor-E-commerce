const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const response = require('../helpers');

exports.signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields required" });
        }

        const checkEmail = await Admin.findOne({ email });

        //Admin is deleted
        if (checkEmail && checkEmail.is_deleted) {
            return response.error(res, 1018, 409);
        };

        //Admin already exist
        if (checkEmail) {
            return response.error(res, 1004, 409);
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        await Admin.create({
            email,
            password: hashedPassword,
            name
        });

        return response.success(res, 1001, null, 201);
    } catch (error) {
        console.log('error', error);
        return response.error(res, 9999);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await User.findOne({ email });
        if (!admin) {
            return response.error(res, 1005);
        };

        // Check if admin is deleted
        if (admin.is_deleted) {
            return response.error(res, 1018, 409);
        };

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create token
        const token = jwt.sign(
            { adminId: admin._id, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        return response.success(res, 1002, token);
    } catch (error) {
        console.log('error', error);
        return response.error(res, 9999);
    }
};

exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        return response.success(res, 1002, token);
    } catch (error) {
        console.log('error', error);
        return response.error(res, 9999);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { _id } = req.admin;
        const admin = await Admin.findOne({ _id }, '_id name email');
        return response.success(res, 1003, admin);
    } catch (error) {
        console.log('error', error);
        return response.error(res, 9999);
    }
};