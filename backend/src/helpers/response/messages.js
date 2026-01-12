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

    //Category
    '2001': 'Category created successfully.',
    '2002': 'Category not found!',
    '2003': 'Category deleted',
    '2004': 'Category updated',

    //Product
    '3001': 'Product created successfully',
    '3002': 'Product not found!',
    '3003': 'Product updated',
    '3004': 'Product deleted',

    // Common
    '9000': 'Please enter valid data!',
    '9001': 'Not found.',
    '9999': 'Something went wrong!',
};

module.exports.getMessage = function (messageCode) {
    if (isNaN(messageCode)) return messageCode;
    return MESSAGES[messageCode] || '';
};
