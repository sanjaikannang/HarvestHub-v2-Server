import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "../src/config/db.js";
import userRoutes from "../src/routes/user.routes.js"
import productRoutes from "../src/routes/product.routes.js"

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// API Endpoints
app.use('/user', userRoutes); // User Routes
app.use('/product', productRoutes); // Product Routes

// app.use('/', (req, res) => {
//     res.send("This is a 'HarverstHub-V2' Project !!!")
// })

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
