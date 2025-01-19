import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get('/users',auth,getUsersForSidebar)
router.get('/:id',auth,getMessages)
router.post('/send/:id',auth,sendMessage)


export default router;