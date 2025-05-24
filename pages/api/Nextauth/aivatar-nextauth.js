import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    createUser: async ({ user }) => {
      // Crear un avatar automático al registrarse por primera vez
      await prisma.avatar.create({
        data: {
          name: `Avatar de ${user.email.split('@')[0]}`, // Ej: Avatar de juan
          ownerId: user.id,
        },
      });
    },
  },
});
