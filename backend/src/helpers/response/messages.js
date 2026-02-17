const MESSAGES = {

    // User, Admin and Seller
    '1001': 'Registered successfully.',
    '1002': 'Sign in successfully.',
    '1003': 'Already registered with this email!',
    '1004': 'Please enter email and password.',
    '1005': 'Logout successfully.',
    '1006': 'User not found!',
    '1007': 'Please enter correct password.',
    '1008': 'Unauthorized user.',
    '1009': 'Your account is deactivated.',
    '1010': 'Profile fetched successfully.',
    '1011': 'Profile updated successfully.',
    '1012': 'Profile deactivated successfully.',
    '1013': 'OTP sent successfully.',
    '1014': 'Invalid OTP.',
    '1015': 'OTP expired.',
    '1016': 'Email verified successfully.',
    '1017': 'Please verify your email first.',
    '1018': 'OTP already sent. Please wait before requesting again.',
    '1019': 'Too many login attempts. Please try again later.',
    '1020': 'Seller account is not approved by admin.',
    '1021': "Seller status changed.",
    '1022': 'User already verified.',
    '1023': 'Access Token updated.',
    '1024': 'Access Token not updated.',
    '1025': 'Stripe account created.',
    '1026': 'Seller already approved.',

    //Category
    '2001': 'Category created successfully.',
    '2002': 'Category not found!',
    '2003': 'Category deleted successfully.',
    '2004': 'Category updated successfully.',

    //Product
    '3001': 'Product created successfully.',
    '3002': 'Product not found!',
    '3003': 'Product updated successfully.',
    '3004': 'Product deleted successfully.',

    //Cart Item
    '4001': 'Product added in Cart.',
    '4002': 'Cart Item not found!',
    '4003': 'Cart Item updated successfully.',
    '4004': 'Cart Item deleted successfully.',

    //Order, Order Item, Payout
    '5001': 'Cart empty.',
    '5002': 'Payment failed.',
    '5003': 'Order placed.',
    '5004': 'Order history.',
    '5005': 'Order Item refunded.',
    '5006': 'Order Item not found.',
    '5007': 'Order Item status updated.',
    '5008': 'Invalid input',
    '5009': 'Not eligible for cancel order.',
    '5010': 'Payment not found.',
    '5011': 'Order Cancelled.',
    '5012': 'Payout record not found.',
    '5013': 'Seller has already been paid for this item.',
    '5014': 'This order was refunded.',
    '5015': 'Seller Stripe account not found or not connected.',
    '5016': 'Seller Stripe account not found or not connected.',
    '5017': 'Can\'t be refunded',
    '5018': 'Product can\'t be returned.',
    '5019': 'Can\'t return.',
    '5020': 'Return application has been submitted.',
    '5021': 'Return Status updated.',
    '5022': 'Insufficient stock.',

    //Chat
    '6001': 'User can\'t create group.',
    '6002': 'Group created successfully.',
    '6003': 'Groups included in.',
    '6004': 'No valid participants found. Please check the emails.',
    '6005': 'Private chat created.',
    '6006': 'Access Denied: You are not a member of this chat room.',

    // Common
    '9000': 'Please enter valid data!',
    '9001': 'Not found.',
    '9999': 'Something went wrong!',
};

module.exports.getMessage = function (messageCode) {
    if (isNaN(messageCode)) return messageCode;
    return MESSAGES[messageCode] || '';
};
