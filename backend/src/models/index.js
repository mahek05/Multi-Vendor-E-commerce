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
const Chat = require("./chat.model");
const ChatRoom = require("./chat_room.model");
const RoomParticipant = require("./room_participant.model");

User.hasMany(CartItem, { foreignKey: "user_id" });
CartItem.belongsTo(User, { foreignKey: "user_id" });

Product.hasMany(CartItem, { foreignKey: "product_id" });
CartItem.belongsTo(Product, { foreignKey: "product_id" });

User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Product.hasMany(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

Order.hasOne(Payment, { foreignKey: "order_id" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

Seller.hasMany(Product, { foreignKey: "seller_id" });
Product.belongsTo(Seller, { foreignKey: "seller_id" });

Category.hasMany(Product, { foreignKey: "category_id" });
Product.belongsTo(Category, { foreignKey: "category_id" });

OrderItem.hasOne(Payout, { foreignKey: "order_item_id" });
Payout.belongsTo(OrderItem, { foreignKey: "order_item_id" });

ChatRoom.hasMany(Chat, { foreignKey: "room_id", onDelete: "CASCADE" });
Chat.belongsTo(ChatRoom, { foreignKey: "room_id" });

ChatRoom.hasMany(RoomParticipant, { foreignKey: "room_id", onDelete: "CASCADE" });
RoomParticipant.belongsTo(ChatRoom, { foreignKey: "room_id" });

User.hasMany(RoomParticipant, { foreignKey: "user_id", constraints: false });
RoomParticipant.belongsTo(User, { foreignKey: "user_id", constraints: false });

Seller.hasMany(RoomParticipant, { foreignKey: "user_id", constraints: false });
RoomParticipant.belongsTo(Seller, { foreignKey: "user_id", constraints: false });

Admin.hasMany(RoomParticipant, { foreignKey: "user_id", constraints: false });
RoomParticipant.belongsTo(Admin, { foreignKey: "user_id", constraints: false });

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
    Chat,
    ChatRoom,
    RoomParticipant
};

module.exports = db;