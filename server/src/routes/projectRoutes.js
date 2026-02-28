import express from 'express';
import { 
  getAllProjects, 
  filterProjects, 
  createProject, 
  updateProject, 
  assignLeadToProject,
  getProjectsByLead, // Importez la nouvelle méthode
  createTeamForProject,
  getProjectUserMembers,
  getUserParticipatingProjects
} from '../controllers/projectController.js';

// projectRoutes.js - REORDERED
const router = express.Router();
router.get('/participating/:userId', getUserParticipatingProjects); // Get projects where user is a member (not lead)

router.get('/filter', filterProjects);
router.get('/lead/:leadId', getProjectsByLead);

// Move this UP so it matches BEFORE the generic /:id
router.get('/:projectId/members', getProjectUserMembers); 

router.get('/', getAllProjects);
router.post('/', createProject);
router.patch('/:id', updateProject); // Generic IDs stay at the bottom
router.patch('/:projectId/assign-lead', assignLeadToProject);
router.post('/:projectId/team', createTeamForProject);

export default router;