import jwt from "jsonwebtoken";

// make a cookie and send it back to the client
export const generateTokenAndSetCookie = (userId, res) =>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{ //creating a token encoded with secret key having user_id as payload
        expiresIn: '15d'
    })
    //  generated a token using jwt.sign for 15D uniquely by user_id
    // and pass it as a cookie to the user

    res.cookie("jwt", token,{
        maxAge:15*24*60*60*1000, // 15 days in milliseconds
        httpOnly: true, // prevent XSS attacks cross site scripting attacks
        sameSite:"strict",
        secure: process.env.NODE_ENV !== "development",

    })
    // now wehn user requests udating profile or deleting post it's gonnna send this cookie as a request too ans server will decode this token and see if this is valid or not
    // if not it's gonna allow the user to do the action
}