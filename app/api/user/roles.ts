import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // In production, fetch roles from your database
    // This is a simplified example
    
    // Example: Fetch from database
    // const user = await prisma.user.findUnique({
    //   where: { clerkId: userId },
    //   select: { roles: true }
    // });
    
    // For demo purposes, we'll use static assignments
    // You should replace this with actual database queries
    const adminUsers = ['user_1234', 'user_5678']; // Clerk user IDs for admins
    const organizerUsers = ['user_5678', 'user_9012']; // Clerk user IDs for organizers
    
    const roles = [];
    if (adminUsers.includes(userId)) roles.push('admin');
    if (organizerUsers.includes(userId)) roles.push('organizer');
    
    return res.status(200).json({ roles });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}