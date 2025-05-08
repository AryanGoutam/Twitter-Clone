import express from "express";
import {getMe, login, logout, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

// router to route to the specific endpoint 
// so look in server.js the middleware which is calling /api/auth to this and it will get this 
// export router requests based on the url
// the functions in controller cause that's what it is for
const router = express.Router();
// protectRoute is a middleware under middleware folder
// it will do the decoding of cookie to see if the user is valid or not
router.get("/me", protectRoute,getMe) // auth check

router.post("/signup",signup);

router.post("/login", login);

router.post("/logout",logout);


export default router;