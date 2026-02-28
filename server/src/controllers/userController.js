import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Fetch all users with the USER role
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, name: true, email: true }
    });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch all users with the LEAD role
export const getAllLeads = async (req, res) => {
  try {
    const leads = await prisma.user.findMany({
      where: { role: 'LEAD' }, // Ensure this matches your Prisma Enum exactly
      select: { id: true, name: true, email: true }
    });
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leads: " + error.message });
  }
};