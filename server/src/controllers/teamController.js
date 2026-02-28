import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all teams with their Lead and Members
export const getTeamHierarchy = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        // Fetch the user designated as Team Lead
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        // Fetch all users belonging to this team
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        // Count related projects for the badge
        _count: {
          select: { projects: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json(teams);
  } catch (error) {
    console.error("Hierarchy Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch team hierarchy: " + error.message });
  }
};