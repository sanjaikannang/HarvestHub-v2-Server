import { PRODUCT_CONSTANTS } from '../constants/product.constants.js';
import { CustomError } from '../utils/customError.js';


// Formats a date to IST (UTC+5:30)
export function formatToIST(date) {
    if (!date) return null;

    // Create a new date object and adjust for IST (UTC+5:30)
    const istDate = new Date(date);
    istDate.setMinutes(istDate.getMinutes() + 330); // Add 5 hours and 30 minutes

    return istDate.toISOString();
}


// Formats all date fields in a product object to IST
export function formatProductDatesToIST(product) {
    const dateFields = ['startingDate', 'endingDate', 'bidStartTime', 'bidEndTime'];
    const formatted = product.toObject();

    dateFields.forEach(field => {
        if (formatted[field]) {
            formatted[field] = formatToIST(formatted[field]);
        }
    });

    return formatted;
}


// Validates the bid timing constraints
export function validateBidTiming(bidStart, bidEnd, start, end) {
    const bidDuration = bidEnd.getTime() - bidStart.getTime();

    if (
        bidStart < start ||
        bidEnd > end ||
        bidDuration < PRODUCT_CONSTANTS.MIN_BID_DURATION ||
        bidDuration > PRODUCT_CONSTANTS.MAX_BID_DURATION
    ) {
        throw new CustomError(
            'Invalid bidding time. Duration must be between 10 minutes and 1 hour within the given date range.',
            400
        );
    }
}