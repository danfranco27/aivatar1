import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (req.method === 'POST') {
    const { name } = req.body;

    const existing = await prisma.avatar.findUnique({
      where: { ownerId: user.id },
    });
    if (existing) return res.status(400).json({ message: 'Avatar already exists' });

    const avatar = await prisma.avatar.create({
      data: {
        name,
        ownerId: user.id,
      },
    });

    return res.status(200).json({ message: 'Avatar created', avatar });
  }

  if (req.method === 'GET') {
    const avatar = await prisma.avatar.findUnique({
      where: { ownerId: user.id },
      include: { agents: true },
    });

    return res.status(200).json({ avatar });
  }

  res.status(405).json({ message: 'Method not allowed' });
}
