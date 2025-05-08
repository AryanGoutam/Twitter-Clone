import User from "../models/user.model.js";
import Post from "../models/post.model.js"
import {v2 as cloudinary} from "cloudinary";
import Notification from "../models/notification.model.js";

export const createPost = async(req,res) => {
    try {
        const {text} = req.body;
        let{img} = req.body;

        const userId =  req.user._id.toString(); // to check if the user exists 
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message: "User not found"})
        if(!text && !img) return res.status(400).json({error:"Post mus have a text or an image"});

        //cloudinary image upload if image given
        if (img){
            const uploadedResponse= await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        // store it in model
        const newPost = new Post({
            user:userId,
            text,
            img
        }) 
        // save the updation
        await newPost.save();
        res.status(201).json(newPost);


    } catch (error) {
        console.log("error in createPost controller", error.message);
        res.status(500).json({error:"Internal Server Error "});

    }
}

export const deletePost = async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        if(post.user.toString ()!== req.user._id.toString()){
            return res.status(401).json({error:"You are not authorized to delete this post"});
        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"Post deleted successfully"});

    } catch (error) {
        res.status(500).json({error:"Internal Server Error"});
        console.log("Error in delete post controller", error);
    }
}

export const commentOnPost = async(req,res) => {
    try {
        
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            return res.status(400).json({error:"Text field is required"});
        }
        const post = await Post.findById(postId);
        if(!post){
            return res.status(400).json({error:"Post not found"});

        }   
        
        const comment = {user:userId,text};
        post.comments.push(comment);
        await post.save();

        res.status(200).json(post);

    } catch (error) {
        console.log("error in commentOnPost controller", error.message);
        res.status(500).json({message:"Internal server error"});
    }
}


export const likeUnlikePost = async(req,res)=>{
    try {
        const userId = req.user._id;
        const {id:postId} = req.params;

        const post = await Post.findById(postId);
        if(!post) return res.status(400).json({error:"Post not found"});

        const userLikedPost = post.likes.includes(userId);
        if(userLikedPost){
            // unlike the post
            await Post.updateOne({_id:postId}, {$pull:{likes:userId} });
            // updating the user model with the unliked post
            await User.updateOne({_id:userId},{$pull:{likedPosts: postId}})

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
            res.status(200).json(updatedLikes);

        }else{
            // like post 
            post.likes.push(userId);
            await User.updateOne({_id:userId}, {$push: {likedPosts: postId}});
            await post.save();
            // sending notification that someone liked your post
            const notification = new Notification({
                from:userId,
                to:post.user, // users post
                type:"like"
            })
            await notification.save();
            const updatedLikes = post.likes;
            res.status(200).json(updatedLikes);
        }



    } catch (error) {
        console.log("Error in linkeUnlikePost ", error);
        res.status(500).json({error:"Internal server error"});
    }
}

export const getAllPost = async(req,res) =>{
    try {
        // .find will find all the posts and the -1 will give the latest post at the top
        // populate will get the user data from the user model
        const posts =  await Post.find().sort({createdAt:-1}).populate({
            path:"user",
            select: "-password",
        })
        // this for getting the comments user data
        .populate({
            path:"comments.user",
            select:"-password",
        })

        if(posts.length === 0) return res.status(200).json([]);

        res.status(200).json(posts);

    } catch (error) {
        console.log("error in getAllPost controller", error.message);
        res.status(500).json({error:"Internal server error"});
    }
}


export const getLikedPosts = async(req,res) =>{
    const userId = req.params.id;

    try {
        
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error:"User not found"});      

        // checking if the postid is in the users likedPosts 
        // just added likedPosts now so the users before that won't have likedPosts array 
        // i.e aryan anad basseer
        const likedPostss = await Post.find({_id: {$in: user.likedPosts}})
        .populate({
            path:"user",
            select: "-password"      
        }).populate({
            path: "comments.user",
            select:"-password"
        });
        res.status(200).json(likedPostss);
    } catch (error) {
        console.log("error in getlikedPosts", error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
}

export const getFollowingPosts = async(req,res)=>{
    try {
        const userId = req.user._id; //currently authenticated user
        const user = await User.findById(userId);

        if(!user) return res.json(404).json({error:"User not found"});

        const following = user.following;
        const feedPosts = await Post.find({user:{$in:following}}).sort({createdAt:-1})
        .populate({
            path:"user",
            selecr:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        });


        res.status(200).json({feedPosts});


    } catch (error) {
        console.log("Error in getFollowingPosts controller ", error.message);
        res.status(500).json({error:"Internal Server Error"})
    }
}

export const getUserPosts = async(req,res)=>{
    try {

        const {username} = req.params;
        const user = await User.findOne({username});
        if(!user) return res.status(404).json({error:"User not found"});

        const posts = await Post.find({user:user._id}).sort({createdAt:-1})
        .populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        });
        res.status(200).json(posts);
        
    } catch (error) {
        console.log("Error in getUserPosts controller ",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
}