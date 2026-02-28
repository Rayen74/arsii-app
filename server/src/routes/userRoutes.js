import express from 'express';
import { getAllEmployees, getAllLeads } from '../controllers/userController.js';

const router = express.Router();

router.get('/employees', getAllEmployees); // GET /api/users/employees
router.get('/leads', getAllLeads);           // GET /api/users/leads

export default router;