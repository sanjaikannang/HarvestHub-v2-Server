import Product from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import handleUpload from '../services/cloudinaryService.js';
import { PRODUCT_CONSTANTS, PRODUCT_STATUS } from '../constants/product.constants.js';


// UploadProduct Controller ( Role : Farmer )
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



// ----------------------------------------------------------------------------------------



// VerifyProduct Controller ( Role : Admin )
export const verifyProduct = asyncHandler(async (req, res) => {


    // ===== Authorization Check =====
    // Ensure that only Admin can verify and approve the products
    // If the user's role is not "Admin", respond with a 403 error (Forbidden)    
    if (req.user.role !== "Admin") {
        return res.status(403).json({
            message: 'Only Admin can Verify and Approve the Products !'
        });
    }


    // Extract productId, action, and rejectionReason from the request
    const { productId } = req.params;
    const { action, rejectionReason } = req.body;


    // Check if the product exists in the database using the productId
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({
            message: 'Product Not Found !'
        });
    }


    // Check if the product is already verified or rejected
    if (product.status !== PRODUCT_STATUS.PENDING) {
        return res.status(400).json({
            message: `Product is Already ${product.status}!`
        });
    }


    // Process verification based on the action (Accept or Reject)
    if (action === 'Accept') {
        // If the action is 'Accept', update the product status to 'Accepted', mark it as verified,
        // and store the ID of the admin who verified the product
        product.status = PRODUCT_STATUS.ACCEPTED;
        product.verifiedBy = req.user._id;
        product.quality = 'Verified';
    } else if (action === 'Reject') {
        // If the action is 'Reject', ensure that rejectionReason is provided
        if (!rejectionReason) {
            return res.status(400).json({
                message: 'Rejection Reason is Required !'
            });
        }

        // Update the product status to 'Rejected' and store the rejection reason
        product.status = PRODUCT_STATUS.REJECTED;
        product.rejectionReason = rejectionReason;
    } else {
        return res.status(400).json({
            message: 'Invalid Action ! Use "Accept" or "Reject"'
        });
    }


    // Save the updated product to the database
    await product.save();


    return res.status(200).json({
        message: `Product ${action}ed successfully!`,
        product
    });

});



// ----------------------------------------------------------------------------------------



// GetAllProduct Controller ( Role : All Roles )
export const getProducts = asyncHandler(async (req, res) => {


    // Get all products and populate the 'farmer' details (name, email)
    // Sort products by creation date in descending order (newest first)
    const products = await Product.find()
        .populate('farmer', 'name email')
        .sort({ createdAt: -1 }); // Sort by newest first


    // Return the products list along with the count
    return res.status(200).json({
        message: 'Products Fetched Successfully !',
        count: products.length,
        products
    });

})



// ----------------------------------------------------------------------------------------



// GetSpecificProduct Controller ( Role : All Roles )
export const getSpecificProduct = asyncHandler(async (req, res) => {


    // Extract productId from the request parameters
    const { productId } = req.params;


    // Get a specific product by its ID and populate the 'farmer' details (name, email)
    const product = await Product.findById(productId)
        .populate('farmer', 'name email')
    // .populate('bids') // If you want to include bid details
    // .populate('shipping'); // If you want to include shipping details

    // If the product is not found, return a 404 error (Product Not Found)
    if (!product) {
        return res.status(404).json({
            message: 'Product Not Found !'
        });
    }

    return res.status(200).json({
        message: 'Product Fetched Successfully !',
        product
    });

})