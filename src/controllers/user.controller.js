import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isValidEmail, isValidPhoneNumber, isValidPassword } from '../validators/validator.js';


// Controller for Signup
export const signup = async (req, res) => {
    try {
        const { name, email, password, role, phoneNo } = req.body;

        // Check if role is 'Admin', if yes, return with an error
        if (role === 'Admin') {
            return res.status(400).json({ message: 'Admin cannot sign up' });
        }

        // Validate email
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate phone number
        if (!isValidPhoneNumber(phoneNo)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }

        // Validate password
        if (!isValidPassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a digit, and a special character',
            });
        }

        // Check if user with the given email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with hashed password
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            phoneNo
        });

        // Save the new user to the database
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send success response with token and user details (exclude password)
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                phoneNo: newUser.phoneNo
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Controller for Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10h' });

        // Send success response with token and user details (exclude password)
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNo: user.phoneNo
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};