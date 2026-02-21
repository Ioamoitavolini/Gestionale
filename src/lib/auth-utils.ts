import { prisma } from '@/lib/db';
import bcryptjs from 'bcryptjs';

/**
 * Esegui il hash di una password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcryptjs.hash(password, saltRounds);
}

/**
 * Verifica se una password corrisponde al hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword);
}

/**
 * Autentica un utente con email e password
 */
export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.active) {
    throw new Error('Utente non trovato o disattivato');
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Password non corretta');
  }

  return user;
}

/**
 * Crea un nuovo utente con password hashata
 */
export async function createUser(
  email: string,
  password: string,
  name: string,
  role: 'ADMIN' | 'RECEPTIONIST' = 'RECEPTIONIST'
) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email già in uso');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
  });

  return user;
}
