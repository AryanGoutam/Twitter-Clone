import express from "express";
import { getUserProfile,followUnfollow,getSuggestedUsers ,updateUser} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get('/profile/:username',protectRoute ,getUserProfile);
router.get('/suggested', protectRoute,getSuggestedUsers);
router.post('/follow/:id',protectRoute, followUnfollow);
router.post('/update',protectRoute ,updateUser );

export default router;