const MESSAGES = {

    // Auth
    '1001': 'Register successfully.',
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

    // Common
    '9000': 'Please enter valid data!',
    '9001': 'Not found.',
    '9999': 'Something went wrong!',
};

module.exports.getMessage = function (messageCode) {
    if (isNaN(messageCode)) return messageCode;
    return MESSAGES[messageCode] || '';
};
