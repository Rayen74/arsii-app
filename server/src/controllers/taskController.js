import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get tasks with dynamic filtering (Priority & Status)
export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { priority, status } = req.query; 

    const whereClause = { projectId };

    // Apply priority filter if it's not 'ALL'
    if (priority && priority !== 'ALL') {
      whereClause.priority = priority;
    }

    // Apply status filter if it's not 'ALL'
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Filter failed: " + error.message });
  }
};

// 1. Create Task with Assignee
// Updated Task Creation to include assigneeId
export const createTask = async (req, res) => {
  const { title, priority, dueDate, projectId, assigneeId } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        title,
        priority,
        dueDate: new Date(dueDate),
        projectId,
        assigneeId, // Ensure your Prisma schema has this field
      }
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Fetch Team Members for a specific Project
export const getProjectTeamMembers = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: { members: true }
        }
      }
    });
    res.status(200).json(project?.team?.members || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserTasksByProject = async (req, res) => {
  const { projectId, userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId,
        assigneeId: userId, // FIXED: Changed from assignedToId to assigneeId
      },
      include: {
        project: { 
          select: { name: true } 
        },
      },
      orderBy: { 
        dueDate: 'asc' // FIXED: Changed from deadline to dueDate
      },
    });

    res.status(200).json(tasks);
  } catch (error) {
    // This will now catch any remaining logic errors
    res.status(500).json({ error: "Database query failed: " + error.message });
  }
};