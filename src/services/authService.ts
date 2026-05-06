import { runQuery, runMutation, saveSession, clearSession, getCurrentSession } from './database';
import { User, Session } from '@/types';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function login(email: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    const users = await runQuery<User>('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    
    if (users.length === 0) {
      return null;
    }
    
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return null;
    }
    
    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const session: Session = {
      id: uuidv4(),
      user_id: user.id,
      token: tokenId,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    };
    
    await runMutation(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [session.id, session.user_id, session.token, session.expires_at]
    );
    
    await saveSession(session);
    
    await runMutation('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    
    return { user, token: tokenId };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const session = await getCurrentSession();
    if (session) {
      await runMutation('DELETE FROM sessions WHERE id = ?', [session.id]);
    }
    await clearSession();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

export async function checkAuth(): Promise<User | null> {
  try {
    const session = await getCurrentSession();
    
    if (!session) {
      return null;
    }
    
    const now = new Date().toISOString();
    if (session.expires_at < now) {
      await clearSession();
      return null;
    }
    
    const users = await runQuery<User>('SELECT * FROM users WHERE id = ? AND is_active = 1', [session.user_id]);
    
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Check auth error:', error);
    return null;
  }
}

export async function registerUser(userData: Partial<User> & { password: string }): Promise<User> {
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  await runMutation(
    `INSERT INTO users (id, email, password_hash, nome, cognome, ruolo, numero_iscrizione_albo, provincia_albo, specializzazione)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      userData.email,
      hashedPassword,
      userData.nome,
      userData.cognome,
      userData.ruolo || 'medico',
      userData.numero_iscrizione_albo,
      userData.provincia_albo,
      userData.specializzazione,
    ]
  );
  
  const users = await runQuery<User>('SELECT * FROM users WHERE id = ?', [userId]);
  return users[0];
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.nome !== undefined) { fields.push('nome = ?'); values.push(updates.nome); }
  if (updates.cognome !== undefined) { fields.push('cognome = ?'); values.push(updates.cognome); }
  if (updates.numero_iscrizione_albo !== undefined) { fields.push('numero_iscrizione_albo = ?'); values.push(updates.numero_iscrizione_albo); }
  if (updates.provincia_albo !== undefined) { fields.push('provincia_albo = ?'); values.push(updates.provincia_albo); }
  if (updates.specializzazione !== undefined) { fields.push('specializzazione = ?'); values.push(updates.specializzazione); }
  if (updates.is_active !== undefined) { fields.push('is_active = ?'); values.push(updates.is_active ? 1 : 0); }
  
  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);
    await runMutation(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function getAllUsers(): Promise<User[]> {
  return await runQuery<User>('SELECT * FROM users ORDER BY cognome, nome');
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await runQuery<User>('SELECT * FROM users WHERE id = ?', [id]);
  return users.length > 0 ? users[0] : null;
}
