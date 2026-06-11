import type { AuthRegisterRequest } from "@lingolink/shared";
import bcrypt from "bcrypt";
import { signJwt } from "../utils/jwt";
import {
  createUser,
  findUserByEmailOrPhone,
  findUserByEmail,
  findUserByUsername,
  findUserByPhone,
  findUserById,
} from "../models/userModel";

const saltRounds = 12;

export async function registerUser(payload: AuthRegisterRequest) {
  // Check for existing users
  const existingEmail = await findUserByEmail(payload.email);
  if (existingEmail) {
    throw new Error("Email is already registered");
  }

  if (payload.phone) {
    const existingPhone = await findUserByPhone(payload.phone);
    if (existingPhone) {
      throw new Error("Phone number is already registered");
    }
  }

  const existingUsername = await findUserByUsername(payload.username);
  if (existingUsername) {
    throw new Error("Username is already taken");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(payload.password, saltRounds);

  // Create user
  const user = await createUser({
    email: payload.email,
    phone: payload.phone || "",
    username: payload.username,
    passwordHash,
    preferredLanguage: payload.preferredLanguage || "en",
  });

  // Generate token
  const token = signJwt({
    id: user.id,
    email: user.email,
    preferredLanguage: user.preferredLanguage,
  });

  return { user, token };
}

export async function loginUser(identifier: string, password: string) {
  // Find user by email or phone
  const user = await findUserByEmailOrPhone(identifier);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Verify password
  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  const safeUser = await findUserById(user.id);
  if (!safeUser) {
    throw new Error("User not found");
  }

  // Generate token
  const token = signJwt({
    id: user.id,
    email: user.email,
    preferredLanguage: user.preferredLanguage,
  });

  return { user: safeUser, token };
}
