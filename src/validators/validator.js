// Function to Validate Email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};


// Function to Validate Phone Number
export const isValidPhoneNumber = (phoneNo) => {
    const phoneRegex = /^\d{10}$/; // Accepts exactly 10 digits
    return phoneRegex.test(phoneNo);
};


// Function to Validate Password
export const isValidPassword = (password) => {
    // Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a digit, and a special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};