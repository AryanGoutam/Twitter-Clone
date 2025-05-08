// routes folder -> For different API routes 
// models folser -> For monogdb not tables but collections
// controlers folder -> each routes will have functions so for that


import express from "express"
import connectMongoD from "./db/connectMongoDB.js";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";
import router from "./routes/auth.routes.js";

import authRoutes  from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"
import notificationRoutes from "./routes/notification.routes.js"

dotenv.config();
cloudinary.config({ // for cover img n all in user controller
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME ,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const port = process.env.PORT || 3000; 
app.use(express.urlencoded({extended:true})); // to parse form data
app.use(express.json({limit:"5mb"})); //to parse req.body
app.use(cookieParser())

app.get("/" , (req,res) => {
    res.send("Server is ready")
})

app.use('/', router);
app.use("/api/auth" , authRoutes);
app.use("/api/users", userRoutes );
app.use("/api/posts", postRoutes );
app.use("/api/notifications",notificationRoutes);

app.listen(port, () => {
    console.log(`Server is running at port ${port}` )
    connectMongoD();
})