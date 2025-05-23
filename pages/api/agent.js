import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { avatar: true },
  });

  if (!user?.avatar) {
    return res.status(404).json({ message: 'No avatar found for this user' });
  }

  if (req.method === 'POST') {
    const { role } = req.body;

    const agent = await prisma.agent.create({
      data: {
        role,
        avatarId: user.avatar.id,
      },
    });

    return res.status(200).json({ message: 'Agent created', agent });
  }

  if (req.method === 'GET') {
    const agents = await prisma.agent.findMany({
      where: { avatarId: user.avatar.id },
    });

    return res.status(200).json({ agents });
  }

  res.status(405).json({ message: 'Method not allowed' });
}
