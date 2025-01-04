import { BIDDING_STATUS } from '../constants/product.constants.js';


// Function to update the bidding status of products
export const updateBiddingStatus = async (Product) => {
    try {

        // Get the current date and time
        const now = new Date();


        // Fetch products where their bidding status needs to be updated
        const products = await Product.find({
            $or: [
                // For products with an active bidding status where the bid end time has passed
                {
                    biddingStatus: BIDDING_STATUS.ACTIVE,
                    bidEndTime: { $lte: now }
                },
                // For products with an upcoming bidding status where the bid start time has passed
                {
                    biddingStatus: BIDDING_STATUS.UPCOMING,
                    bidStartTime: { $lte: now }
                },
                // For products where the bidding status is not one of the predefined statuses (invalid status)
                {
                    biddingStatus: { $nin: Object.values(BIDDING_STATUS) }
                }
            ]
        });


        // Prepare bulk operations to update products' bidding status
        const bulkOps = products.map(product => {
            let newStatus;

            // Determine the new bidding status based on the current time and product's start and end times
            if (now < product.bidStartTime) {
                newStatus = BIDDING_STATUS.UPCOMING;  // If the current time is before the start time, status is 'UPCOMING'
            } else if (now >= product.bidStartTime && now < product.bidEndTime) {
                newStatus = BIDDING_STATUS.ACTIVE;  // If the current time is between start and end times, status is 'ACTIVE'
            } else {
                newStatus = BIDDING_STATUS.ENDED;  // If the current time is after the end time, status is 'ENDED'
            }


            // Only update the status if it has changed
            if (newStatus !== product.biddingStatus) {
                return {
                    updateOne: {
                        filter: { _id: product._id },  // Find the product by its ID
                        update: { $set: { biddingStatus: newStatus } } // Set the new bidding status
                    }
                };
            }
        }).filter(Boolean);  // Filter out any undefined entries (i.e., products with no status change)


        // If there are any bulk operations to perform, execute them
        if (bulkOps.length > 0) {
            await Product.bulkWrite(bulkOps);  // Perform all the update operations in bulk for efficiency
        }


        return true;  // Return true indicating the update was successful


    } catch (error) {
        console.error('Error Updating Bidding Statuses:', error);
        throw error;
    }
};


// Middleware to set the initial bidding status when a product is saved or updated
export const setBiddingStatusMiddleware = function (next) {


    // Get the current date and time
    const now = new Date();


    // Set the product's bidding status based on the current time and its bid start and end times
    if (now < this.bidStartTime) {
        this.biddingStatus = BIDDING_STATUS.UPCOMING;  // If the current time is before the bid start, status is 'UPCOMING'
    } else if (now >= this.bidStartTime && now < this.bidEndTime) {
        this.biddingStatus = BIDDING_STATUS.ACTIVE;  // If the current time is between bid start and end, status is 'ACTIVE'
    } else {
        this.biddingStatus = BIDDING_STATUS.ENDED;  // If the current time is after the bid end, status is 'ENDED'
    }


    // Proceed to the next middleware or save the product
    next();

};