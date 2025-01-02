import { CustomError } from '../utils/customError.js';
import Product from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import handleUpload from '../services/cloudinaryService.js';
import { PRODUCT_CONSTANTS } from '../constants/product.constants.js';


export const uploadProduct = asyncHandler(async (req, res) => {
    // ===== Authorization Check =====
    // Verify that only farmers can upload products
    if (req.user.role !== "Farmer") {
        throw new CustomError('Only Farmers can upload products', 403);
    }

    // ===== Image Upload Validation =====
    // Check if exactly REQUIRED_IMAGE_COUNT (3) images are uploaded
    if (!req.files || req.files.length !== PRODUCT_CONSTANTS.REQUIRED_IMAGE_COUNT) {
        throw new CustomError(`Please upload exactly ${PRODUCT_CONSTANTS.REQUIRED_IMAGE_COUNT} images`, 400);
    }

    // ===== Request Body Validation =====
    // Destructure and validate required fields from request body
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

    // Convert date strings to Date objects for validation
    const startDate = new Date(startingDate);
    const endDate = new Date(endingDate);
    const bidStart = new Date(bidStartTime);
    const bidEnd = new Date(bidEndTime);

    // ===== Date Range Validation =====
    // Calculate the difference in days between start and end dates
    const daysDifference = Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24);

    // Validate that the date range is between 1 and 3 days
    if (daysDifference < 1 || daysDifference > 3) {
        throw new CustomError('The duration between start and end date must be between 1 and 3 days', 400);
    }

    // ===== Bid Time Validation =====
    // Calculate the difference in milliseconds between bid start and end times
    const bidTimeDifference = Math.abs(bidEnd - bidStart);

    // Validate that the bid duration is between MIN_BID_DURATION and MAX_BID_DURATION
    if (bidTimeDifference < PRODUCT_CONSTANTS.MIN_BID_DURATION ||
        bidTimeDifference > PRODUCT_CONSTANTS.MAX_BID_DURATION) {
        throw new CustomError(
            `Bid duration must be between ${PRODUCT_CONSTANTS.MIN_BID_DURATION / (60 * 1000)} minutes and ` +
            `${PRODUCT_CONSTANTS.MAX_BID_DURATION / (60 * 1000)} minutes`,
            400
        );
    }

    // ===== Image Upload Processing =====
    // Array to store Cloudinary image URLs
    const imageUrls = [];

    // Process and upload each image to Cloudinary
    for (const file of req.files) {
        // Validate file data
        if (!file.mimetype || !file.buffer) {
            throw new CustomError("Invalid file data", 400);
        }

        // Convert file to base64 URI format for Cloudinary
        const fileDataURI = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        // Upload to Cloudinary and store the secure URL
        const cldRes = await handleUpload(fileDataURI);
        imageUrls.push(cldRes.secure_url);
    }

    // ===== Product Creation =====
    // Calculate total bid amount based on starting price and quantity
    const totalBidAmount = startingPrice * quantity;

    // Create new product instance with validated data
    const newProduct = new Product({
        farmer: req.user._id,
        name,
        description,
        startingPrice,
        quantity,
        startingDate: startDate,
        endingDate: endDate,
        bidStartTime: bidStart,
        bidEndTime: bidEnd,
        totalBidAmount,
        images: imageUrls,
    });

    // Save the product to database
    const savedProduct = await newProduct.save();

    // ===== Response =====
    // Send success response with farmer and product details
    res.status(201).json({
        message: "Product created successfully!",
        farmer: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        },
        product: savedProduct,
    });
});