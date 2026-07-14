import { prisma } from "../prisma";

type PublicUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

type UpsertUserInput = {
  googleSub: string;
  email: string;
  name: string;
  picture?: string;
};

export async function upsertUserFromGoogle(input: UpsertUserInput): Promise<PublicUser> {
  const user = await prisma.user.upsert({
    where: { googleSub: input.googleSub },
    create: {
      id: crypto.randomUUID(),
      googleSub: input.googleSub,
      email: input.email,
      name: input.name,
      picture: input.picture,
    },
    update: {
      email: input.email,
      name: input.name,
      picture: input.picture,
    },
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture ?? undefined,
  };
}

export async function getUserById(userId: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture ?? undefined,
  };
}

export type { PublicUser };
