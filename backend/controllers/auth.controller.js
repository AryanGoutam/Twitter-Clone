import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateTokens.js';

export const signup   =  async (req,res)=>{
    try {
        
        const{fullName, username, email , password} = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){  // it's checking if the email is correct
            return res.status(400).json({error: "Invalid email format"});
        }

        const existingUser = await User.findOne({username: username});
        if(existingUser){
            return res.status(400).json({error:"Username is already taken"});
        }
        const existingEmail = await User.findOne({email: email});
        if(existingEmail){
            return res.status(400).json({error:"Email is already taken"});
        }

        if(password.length < 6){
            return res.status(400).json({error:"Paswwrod must be arleast 6 cahracters long"})
        }

        // hshing the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);

        // New user
        const newUser = new User({
            fullName:fullName,
            username,
            email,
            password: hashPassword,
        })

        if(newUser){
            generateTokenAndSetCookie(newUser._id,res)
            await newUser.save();
            res.status(201).json({
                    _id:newUser._id ,
                    fullName:  newUser.fullName,
                    username: newUser.username,
                    email:newUser.email,
                    followers: newUser.followers,
                    following:newUser.following,
                    profileImg: newUser.profileImg,
                    coverImg: newUser.coverImg,
            })

        }else{
            res.status(400).jsin({error:"Invalid user data"});

        }



    } catch ( error) {
        console.log("Error in sign up controler", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const login =  async(req,res)=>{
   try {
     
    const {username,password} = req.body;
    const user = await User.findOne({username}); //finding the username in schema
    const isPasswordCorrect = await bcrypt.compare(password,user?.password || "");

    if(!user || !isPasswordCorrect){
        res.status(400).json({error:"Invalid password or username"});
    }

    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
        _id:user._id ,
        fullName:  user.fullName,
        username: user.username,
        email:user.email,
        followers: user.followers,
        following:user.following,
        profileImg: user.profileImg,
        coverImg: user.coverImg,
})    


   } catch (error) {
    console.log("Error in login controller ", error.message);
    return res.status(500).json({error:"Internal Server Error"});
    
   }
}

export const logout =  async(req,res)=>{
    try{
        res.cookie("jwt", "",{maxAge:0}); // it will cear out the cookie that was keeping the user logged in and see in postman after u hit this endpoin the cookie is cleared
        res.status(200).json({message:"Logged out successfully"})

    }catch(error){
        console.log("Error in logout controller", error.message)
        res.status(500). json({error:"Internal server error"})
    }
}


// going to get the authenticated user
// this will do to the auth routes "/me" and before accessing this it will go to protectRoute middleware for the decoding of the cookie to see if the cookie is valid or not
export const getMe = async(req,res) =>{
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message)
        res.status(500). json({error:"Internal server error"})
    }
}