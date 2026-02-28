import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. GET ALL PROJECTS (With Pagination)
export const getAllProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        skip: skip,
        take: limit,
        include: {
          creator: { select: { name: true } },
          lead: { select: { name: true, email: true } }, // Included lead details
          _count: { select: { tasks: true } } // Added task count for UI
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count(),
    ]);

    res.status(200).json({
      data: projects,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. FILTER PROJECTS
export const filterProjects = async (req, res) => {
  try {
    const { status, search } = req.query;

    const projects = await prisma.project.findMany({
      where: {
        AND: [
          status ? { status: status } : {},
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          } : {}
        ]
      },
      include: {
        creator: { select: { name: true } },
        lead: { select: { name: true, email: true } } // Included lead details
      }
    });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    const { name, description, status, creatorId, deadline } = req.body;

    if (!creatorId) {
      return res.status(400).json({ message: "No creatorId provided." });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'PLANNING',
        creatorId, 
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        creator: { select: { name: true } }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Database error: " + error.message });
  }
};

// 4. UPDATE PROJECT
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, deadline } = req.body;

    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: {
        name,
        description,
        status,
        deadline: deadline ? new Date(deadline) : undefined,
      },
      include: {
        lead: { select: { name: true } } // Ensure lead info returns after update
      }
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: "Failed to update project: " + error.message });
  }
};

// 5. ASSIGN LEAD TO PROJECT
export const assignLeadToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { leadId } = req.body;

    // Verify the project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Verify the user exists and is actually a LEAD
    const user = await prisma.user.findUnique({ where: { id: leadId } });
    if (!user || user.role !== 'LEAD') {
      return res.status(400).json({ error: "Selected user is not a valid Lead" });
    }

    // Update Project and create a Notification
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { leadId: leadId },
      include: {
        lead: { select: { name: true } } // Return the name so frontend can update immediately
      }
    });

    await prisma.notification.create({
      data: {
        userId: leadId,
        title: "New Project Assignment",
        message: `You have been assigned as Lead for project: ${project.name}`,
        type: "PROJECT_ASSIGNED",
        referenceId: projectId
      }
    });

    res.status(200).json({ message: "Lead assigned successfully", updatedProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les projets assignés à un Lead spécifique
// Récupérer les projets assignés à un Lead spécifique
export const getProjectsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    const projects = await prisma.project.findMany({
      where: { leadId: leadId },
      include: {
        creator: { select: { name: true } },
        // This will return the team object if it exists, or null if it doesn't
        team: {
          include: {
            members: {
              select: { 
                id: true, 
                name: true, 
                role: true,
                email: true 
              }
            }
          }
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Logical Check: If team is missing, Prisma returns null for the 'team' key.
    // The frontend will see: team: null
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Error fetching projects: " + error.message });
  }
};

// Create a team and link it to a specific project
export const createTeamForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, memberIds, leadId } = req.body;

    // 1. Create the Team and connect members/lead
    const team = await prisma.team.create({
      data: {
        name,
        description,
        leadId: leadId || null,
        members: {
          connect: memberIds?.map(id => ({ id })) || []
        }
      }
    });

    // 2. Link this Team to the Project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { teamId: team.id },
      include: {
        team: {
          include: { members: { select: { id: true, name: true, email: true } } }
        }
      }
    });

    res.status(201).json({ message: "Team created and linked to project", project: updatedProject });
  } catch (error) {
    res.status(500).json({ error: "Failed to create team: " + error.message });
  }
};

export const getProjectUserMembers = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            members: {
              where: {
                role: 'USER' // Only fetch members who are regular users/employees
              },
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }
      }
    });

    // Extract the filtered members list
    const members = project?.team?.members || [];
    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching project users:", error);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
};

// Get projects where the user is a member of the team
export const getUserParticipatingProjects = async (req, res) => {
  const { userId } = req.params;
  try {
    const projects = await prisma.project.findMany({
      where: {
        team: {
          members: {
            some: { id: userId } // Logical check: finds projects where user exists in team members array
          }
        }
      },
      include: {
        lead: { select: { name: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch participating projects: " + error.message });
  }
};