const sequelize = require("../config/sequelize");
const { DataTypes } = require("sequelize");

// 1. Import and Assign Models to Variables
const Admin = require("./admin.model");
const AuthToken = require("./auth_token.model");
const CartItem = require("./cart_item.model");
const Category = require("./category.model");
const EmailOtp = require("./email_otp.model");
const Order = require("./order.model");
const OrderItem = require("./order_item.model");
const Payment = require("./payment.model");
const Payout = require("./payout.model");
const Product = require("./product.model");
const Seller = require("./seller.model");
const User = require("./user.model");

// ==========================================
// 2. Define Associations
// ==========================================

// --- Cart Associations ---
// A User has many items in their cart
User.hasMany(CartItem, { foreignKey: "user_id" });
CartItem.belongsTo(User, { foreignKey: "user_id" });

// A CartItem represents a specific Product
Product.hasMany(CartItem, { foreignKey: "product_id" });
CartItem.belongsTo(Product, { foreignKey: "product_id" });

// --- Order Associations ---
// An Order belongs to a User
User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

// An Order has many Items
Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

// An OrderItem is linked to a Product
Product.hasMany(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

// An Order has one Payment
Order.hasOne(Payment, { foreignKey: "order_id" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

// --- Product Associations ---
// A Product belongs to a Seller
Seller.hasMany(Product, { foreignKey: "seller_id" });
Product.belongsTo(Seller, { foreignKey: "seller_id" });

// A Product belongs to a Category
Category.hasMany(Product, { foreignKey: "category_id" });
Product.belongsTo(Category, { foreignKey: "category_id" });

const db = {
    sequelize,
    Admin,
    AuthToken,
    CartItem,
    Category,
    EmailOtp,
    Order,
    OrderItem,
    Payment,
    Payout,
    Product,
    Seller,
    User,
};

module.exports = db;