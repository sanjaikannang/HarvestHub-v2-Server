import Product from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import handleUpload from '../services/cloudinaryService.js';
import { PRODUCT_CONSTANTS } from '../constants/product.constants.js';


// UploadProduct Controller
export const uploadProduct = asyncHandler(async (req, res) => {

    // ===== Authorization Check =====
    // Ensure that only Farmers can upload products
    if (req.user.role !== "Farmer") {
        return res.status(403).json({
            message: 'Only Farmers can upload products'
        });
    }


    // ===== Request Body Validation =====
    // Destructure required fields from the request body
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


    // Validate that the necessary date fields are provided
    if (!startingDate || !endingDate || !bidStartTime || !bidEndTime) {
        return res.status(400).json({
            message: 'All date and time fields are required'
        });
    }


    // Convert all date fields into Date objects
    const currentDate = new Date();
    const startDate = new Date(startingDate);
    const endDate = new Date(endingDate);
    const bidStart = new Date(bidStartTime);
    const bidEnd = new Date(bidEndTime);


    // ===== Date Range Validation =====
    // Ensure that the start date is in the future
    if (startDate <= currentDate) {
        return res.status(400).json({
            message: 'Starting Date Must be in the Future !'
        });
    }


    // Ensure that the end date is after the start date
    if (endDate <= startDate) {
        return res.status(400).json({
            message: 'Ending Date Must be After Starting Date !'
        });
    }


    // Calculate the duration between start and end dates in hours
    const hoursDifference = (endDate - startDate) / (1000 * 60 * 60);


    // Ensure that the duration is between 24 and 72 hours (1-3 days)
    if (hoursDifference < 24 || hoursDifference > 72) {
        return res.status(400).json({
            message: 'The Duration Between Start and End Date Must be Between 24 and 72 Hours (1-3 Days) !'
        });
    }


    // Ensure that the bid start and bid end times are within the selected date range
    if (bidStart < startDate || bidStart > endDate ||
        bidEnd < startDate || bidEnd > endDate) {
        return res.status(400).json({
            message: 'Bid Start and End Times Must be Within the Selected Date Range !'
        });
    }


    // Calculate the bid duration in minutes
    const bidDurationMinutes = (bidEnd - bidStart) / (1000 * 60);


    // Ensure that the bid duration is between 10 and 60 minutes
    if (bidDurationMinutes < 10 || bidDurationMinutes > 60) {
        return res.status(400).json({
            message: 'Bid Duration Must be Between 10 and 60 Minutes !'
        });
    }


    // ===== Image Upload Processing =====
    // Initialize an empty array to store the URLs of the uploaded images
    const imageUrls = [];


    // Loop through each uploaded file and upload to Cloudinary
    for (const file of req.files) {
        // Check if the file data is valid
        if (!file.mimetype || !file.buffer) {
            return res.status(400).json({
                message: "Invalid File Data !"
            });
        }

        // Convert file data to a base64 string
        const fileDataURI = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        // Upload image to Cloudinary and get the image URL
        const cldRes = await handleUpload(fileDataURI);
        imageUrls.push(cldRes.secure_url);
    }


    // Calculate the total bid amount by multiplying starting price with quantity
    const totalBidAmount = startingPrice * quantity;


    // Create a new product object with the data from the request
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


    // Save the new product to the database
    const savedProduct = await newProduct.save();


    // Respond with a success message and the saved product data
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