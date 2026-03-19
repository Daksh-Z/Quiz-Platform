'use server';

import { db } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Please fill all fields' };

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) return { error: 'Invalid email or password' };
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return { error: 'Invalid email or password' };

    await createSession(user.id, user.role);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: 'Login error: ' + error.message };
  }
}

export async function signupAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) return { error: 'Please fill all fields' };

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return { error: 'Email already exists' };

    const existingName = db.prepare('SELECT id FROM users WHERE name = ? COLLATE NOCASE').get(name);
    if (existingName) return { error: 'Username is already taken. Please choose another one.' };

    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    
    db.prepare('INSERT INTO users (id, name, email, password_hash, raw_password) VALUES (?, ?, ?, ?, ?)').run(id, name, email, hash, password);
    
    await createSession(id, 'USER');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: 'Signup error: ' + error.message };
  }
}

export async function logoutAction() {
    await deleteSession();
}
