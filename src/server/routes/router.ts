// router.ts (ESM)
import { Router } from 'express';
import presence from './presence.js';
import admin from './admin.js';

const router = Router();

router.use('/presence', presence);
router.use('/admin', admin);

export default router;
