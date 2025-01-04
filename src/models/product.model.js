import mongoose from 'mongoose';
import { PRODUCT_STATUS, BIDDING_STATUS } from '../constants/product.constants.js';
import { setBiddingStatusMiddleware } from '../utils/bidStatusManagement.js';


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    startingPrice: {
        type: Number,
        required: [true, 'Starting price is required'],
        min: [0, 'Starting price cannot be negative']
    },
    startingDate: {
        type: Date,
        required: [true, 'Starting date is required']
    },
    endingDate: {
        type: Date,
        required: [true, 'Ending date is required']
    },
    bidStartTime: {
        type: Date,
        required: [true, 'Bid start time is required']
    },
    bidEndTime: {
        type: Date,
        required: [true, 'Bid end time is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    totalBidAmount: {
        type: Number,
        default: function () {
            return this.startingPrice * this.quantity;
        }
    },
    images: [{
        type: String,
        required: [true, 'At least one image is required']
    }],
    status: {
        type: String,
        enum: Object.values(PRODUCT_STATUS),
        default: PRODUCT_STATUS.PENDING
    },
    rejectionReason: String,
    verifiedBy: String,
    quality: {
        type: String,
        default: 'Not-Verified'
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Farmer reference is required']
    },
    bids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid'
    }],
    highestBid: {
        bidder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        amount: Number,
        bidTime: Date
    },
    bidProcessed: {
        type: Boolean,
        default: false
    },
    biddingStatus: {
        type: String,
        enum: Object.values(BIDDING_STATUS),
        default: BIDDING_STATUS.ACTIVE
    },
    shipping: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipping'
    }
}, {
    timestamps: true
});


// Bidding Status Middleware
productSchema.pre('save', setBiddingStatusMiddleware);


// Add indexes for frequently queried fields
productSchema.index({ farmer: 1, status: 1 });
productSchema.index({ biddingStatus: 1, endingDate: 1 });


const Product = mongoose.model('Product', productSchema);
export default Product;