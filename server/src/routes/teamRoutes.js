import express from 'express';
import { 
  getTeamHierarchy, 
  // ... any other team controllers you have
} from '../controllers/teamController.js';

const router = express.Router();

// Specific route for Admin Team Visualization
router.get('/hierarchy', getTeamHierarchy);

export default router;