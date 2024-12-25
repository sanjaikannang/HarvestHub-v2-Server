import { CustomError } from '../utils/customError.js';
import { validateImages, uploadImages } from '../utils/imageUpload.js';
import { validateBidTiming, formatProductDatesToIST } from '../helpers/helperFunction.js';
import Product from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadProduct = asyncHandler(async (req, res) => {
    console.log('Request files:', req.files); // Debug log
    console.log('Request body:', req.body); // Debug log

    // Check if files exist
    if (!req.files) {
        throw new CustomError('No files uploaded', 400);
    }

    // Check if the user is authorized to upload products
    if (req.user.role !== "Farmer") {
        throw new CustomError('Only Farmers can upload products', 403);
    }

    // Validate images
    await validateImages(req.files);

    // Destructure request body
    const {
        bidStartTime,
        bidEndTime,
        startingDate,
        endingDate,
        name,
        description,
        startingPrice,
        quantity,
    } = req.body;

    // Convert dates
    const bidStart = new Date(bidStartTime);
    const bidEnd = new Date(bidEndTime);
    const start = new Date(startingDate);
    const end = new Date(endingDate);

    // Validate bid timing
    validateBidTiming(bidStart, bidEnd, start, end);

    // Upload images to cloudinary
    const imageUrls = await uploadImages(req.files);

    // Calculate total bid amount
    const totalBidAmount = startingPrice * quantity;

    // Create new product
    const newProduct = new Product({
        name,
        description,
        startingPrice,
        startingDate: start,
        endingDate: end,
        bidStartTime: bidStart,
        bidEndTime: bidEnd,
        quantity,
        totalBidAmount,
        images: imageUrls,
        farmer: req.user._id,
    });

    // Save the product
    const savedProduct = await newProduct.save();

    // Format dates to IST
    const formattedProduct = formatProductDatesToIST(savedProduct);

    // Send response
    res.status(201).json({
        message: "Product created successfully",
        product: formattedProduct,
        farmer: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        },
    });
});