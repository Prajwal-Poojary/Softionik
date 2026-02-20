import express from 'express';
import {
    registerUser,
    authUser,
    allUsers,
    updateUserProfile,
    blockUser,
    unblockUser
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);
router.route("/profile").put(protect, upload.single('pic'), updateUserProfile);
router.route("/block").put(protect, blockUser);
router.route("/unblock").put(protect, unblockUser);

export default router;
