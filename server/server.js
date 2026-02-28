import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './src/routes/authRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import teamRoutes from './src/routes/teamRoutes.js';



dotenv.config();

const app = express();

// --- Middleware ---
app.use(morgan('dev')); 
app.use(cors()); 
app.use(express.json()); 

// --- Routes ---
app.get('/', (req, res) => {
  res.json({ message: "Welcome to ARSII-Sfax API" });
});

// ADD THIS DEBUGGER LOG
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Link the authentication routes with the /api/auth prefix
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
// If this says '/api/teams', your URL must be /api/teams/hierarchy
app.use('/api/teams', teamRoutes);

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error("Critical Server Error:", err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// PORT Logic: Ensure this matches your .env or defaults to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});