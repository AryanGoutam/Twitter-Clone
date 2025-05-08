import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// next because it will hit up getMe next 
export const protectRoute = async(req,res,next) =>{
    try {
        
        const token = req.cookies.jwt;
        if(!token){
            return res.sttus(401).json({error:"Unauthorized: No token Provided"});
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        if(!decoded){
            return res.staus(401).json({error:"Unauthorized: Invalid token"});
        }

        // we had a user id in the token as payload 
        // so we r finding the user based on the token and retunr the user but not password
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        req.user = user; //return the user
        next();

    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}