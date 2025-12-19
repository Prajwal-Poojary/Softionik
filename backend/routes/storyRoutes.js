import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getStories, postStory } from '../controllers/storyController.js';

const router = express.Router();

router.route('/').get(protect, getStories);
router.route('/').post(protect, postStory);

export default router;
