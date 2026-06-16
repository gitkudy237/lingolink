import prisma from "../lib/prisma";

export interface UserCreateRequest {
  email: string;
  phone: string;
  username: string;
  passwordHash: string;
  preferredLanguage?: string;
}

export async function createUser(data: UserCreateRequest) {
  return await prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone,
      username: data.username,
      passwordHash: data.passwordHash,
      preferredLanguage: data.preferredLanguage || "en",
    },
    select: {
      id: true,
      email: true,
      phone: true,
      username: true,
      preferredLanguage: true,
      profileImageUrl: true,
      createdAt: true,
    },
  });
}

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserByPhone(phone: string) {
  return await prisma.user.findUnique({
    where: { phone },
  });
}

export async function findUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: { username },
  });
}

export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      phone: true,
      username: true,
      preferredLanguage: true,
      createdAt: true,
    },
  });
}

export async function findUserByEmailOrPhone(identifier: string) {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier },
      ],
    },
  });
}

export async function updateUser(id: string, data: Partial<{ username: string; preferredLanguage: string }>) {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      phone: true,
      username: true,
      preferredLanguage: true,
      createdAt: true,
    },
  });
}

export async function findAllUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      phone: true,
      username: true,
      preferredLanguage: true,
      profileImageUrl: true,
      createdAt: true,
    },
    orderBy: {
      username: "asc",
    },
  });
}
