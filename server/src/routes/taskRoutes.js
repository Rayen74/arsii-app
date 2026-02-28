import express from 'express';
import { getProjectTasks, createTask , getUserTasksByProject } from '../controllers/taskController.js';

const router = express.Router();

router.get('/project/:projectId', getProjectTasks);
router.get('/project/:projectId/user/:userId', getUserTasksByProject); // New route for fetching tasks assigned to a specific user in a specific project
router.post('/', createTask);

export default router;