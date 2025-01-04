import cron from 'node-cron';
import { updateBiddingStatus } from './bidStatusManagement.js';
import Product from '../models/product.model.js';


// Function to start cron jobs
export const startCronJobs = () => {

    // Schedule the task to run every minute
    cron.schedule('* * * * *', async () => {

        // Call the updateBiddingStatus function and pass the Product model
        // This function will update the bidding status for all products
        await updateBiddingStatus(Product);
    });
};