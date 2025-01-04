import Product from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import handleUpload from '../services/cloudinaryService.js';
import { PRODUCT_CONSTANTS } from '../constants/product.constants.js';


// UploadProduct Controller
export const uploadProduct = asyncHandler(async (req, res) => {

    // ===== Authorization Check =====
    // Verify that only farmers can upload products
    if (req.user.role !== "Farmer") {
        return res.status(403).json({
            message: 'Only Farmers can upload products'
        });
    }


    // ===== Image Upload Validation =====
    // Check if exactly REQUIRED_IMAGE_COUNT (3) images are uploaded
    if (!req.files || req.files.length !== PRODUCT_CONSTANTS.REQUIRED_IMAGE_COUNT) {
        return res.status(400).json({
            message: `Please upload exactly ${PRODUCT_CONSTANTS.REQUIRED_IMAGE_COUNT} images`
        });
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


    // Basic input validation
    if (!startingDate || !endingDate || !bidStartTime || !bidEndTime) {
        return res.status(400).json({
            message: 'All date and time fields are required'
        });
    }


    // Convert all dates to UTC Date objects
    const currentDate = new Date();
    const startDate = new Date(startingDate);
    const endDate = new Date(endingDate);
    const bidStart = new Date(bidStartTime);
    const bidEnd = new Date(bidEndTime);


    // ===== Date Range Validation =====
    // Calculate the difference in days between start and end dates
    if (startDate <= currentDate) {
        return res.status(400).json({
            message: 'Starting Date Must be in the Future !'
        });
    }


    if (endDate <= startDate) {
        return res.status(400).json({
            message: 'Ending Date Must be After Starting Date !'
        });
    }


    // Calculate time difference between start and end dates in hours
    const hoursDifference = (endDate - startDate) / (1000 * 60 * 60);

    // Validate 24-72 hour range (1-3 days)
    if (hoursDifference < 24 || hoursDifference > 72) {
        return res.status(400).json({
            message: 'The Duration Between Start and End Date Must be Between 24 and 72 Hours (1-3 Days) !'
        });
    }


    // Validate bid times are within the selected dates
    if (bidStart < startDate || bidStart > endDate ||
        bidEnd < startDate || bidEnd > endDate) {
        return res.status(400).json({
            message: 'Bid Start and End Times Must be Within the Selected Date Range !'
        });
    }


    // Calculate bid duration in minutes
    const bidDurationMinutes = (bidEnd - bidStart) / (1000 * 60);


    // Validate bid duration (10-60 minutes)
    if (bidDurationMinutes < 10 || bidDurationMinutes > 60) {
        return res.status(400).json({
            message: 'Bid Duration Must be Between 10 and 60 Minutes !'
        });
    }


    // Image Upload Processing
    const imageUrls = [];


    for (const file of req.files) {
        if (!file.mimetype || !file.buffer) {
            return res.status(400).json({
                message: "Invalid File Data !"
            });
        }

        const fileDataURI = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const cldRes = await handleUpload(fileDataURI);
        imageUrls.push(cldRes.secure_url);
    }


    // Calculate total bid amount
    const totalBidAmount = startingPrice * quantity;


    // Create new product
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


    const savedProduct = await newProduct.save();


    res.status(201).json({
        message: "Product Created Successfully !",
        farmer: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        },
        product: savedProduct,
    });
});